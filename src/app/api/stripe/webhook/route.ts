// FILE: src/app/api/stripe/webhook/route.ts

import { NextRequest } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // optional but recommended to keep behavior stable:
  // apiVersion: "2024-06-20",
});

const resend = new Resend(process.env.RESEND_API_KEY!);

// Widen types (covers older/odd Stripe type installs and union shapes)
type SubscriptionLike = Stripe.Subscription & {
  current_period_end?: number | null;
  status: Stripe.Subscription.Status;
};

type InvoiceLike = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

function subscriptionHasAccess(sub: SubscriptionLike): boolean {
  const nowSec = Math.floor(Date.now() / 1000);

  const periodStillValid = (sub.current_period_end ?? 0) > nowSec;

  const terminalNoAccess =
    sub.status === "unpaid" || sub.status === "incomplete_expired";

  // canceled can remain valid until period end
  return periodStillValid && !terminalNoAccess;
}

function getSubscriptionIdFromInvoice(invoice: InvoiceLike): string | null {
  const sub = invoice.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return new Response("Missing userId metadata", { status: 400 });

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["subscription"],
    });

    // expand gives Subscription object, but TS may still see union; handle safely
    const subExpanded = fullSession.subscription;
    const subscription =
      typeof subExpanded === "string" || !subExpanded
        ? null
        : (subExpanded as SubscriptionLike);

    const hasSubscription = subscription ? subscriptionHasAccess(subscription) : false;

    await prisma.user.update({
      where: { id: userId },
      data: {
        hasSubscription,
        stripeCustomerId: fullSession.customer?.toString() ?? null,
        stripeSubscriptionId: subscription?.id ?? null,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Thank you for subscribing!",
        html: `
          <p>Hi ${user.displayName || user.username || ""},</p>
          <p>Thank you for subscribing to Axiglot!</p>
          <p><strong>Plan:</strong> Monthly Access</p>
          <p><strong>Amount:</strong> £19.99 per month</p>
          <p>You can manage or cancel your subscription anytime:</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings">Manage Subscription</a></p>
          <p>You can view our terms & conditions here <a href="https://www.axiglot.com/policies.html">Axiglot Policies</a></p>
        `,
      });
    }

    return new Response("ok", { status: 200 });
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as SubscriptionLike;
    const customerId = sub.customer.toString();

    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasSubscription: subscriptionHasAccess(sub),
          stripeSubscriptionId: sub.id,
        },
      });
    }

    return new Response("ok", { status: 200 });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer.toString();

    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasSubscription: false,
          stripeSubscriptionId: null,
        },
      });
    }

    return new Response("ok", { status: 200 });
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as InvoiceLike;
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);

    if (subscriptionId) {
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { hasSubscription: true },
        });
      }
    }

    return new Response("ok", { status: 200 });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as InvoiceLike;
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);

    if (subscriptionId) {
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { hasSubscription: false },
        });
      }

      if (user?.email) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: user.email,
          subject: "Payment Failed - Please Ensure Sufficient Funds",
          html: `
            <p>Hi ${user.displayName || user.username || ""},</p>
            <p>We couldn't process your latest subscription payment.</p>
            <p>Login will not be permitted until payment is successful. If the issue persists, please email info@axiglot.com</p>
            <p>Thanks!</p>
          `,
        });
      }
    }

    return new Response("ok", { status: 200 });
  }

  return new Response("ok", { status: 200 });
}
