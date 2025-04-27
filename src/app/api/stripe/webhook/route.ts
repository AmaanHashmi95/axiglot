import { NextRequest } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { Resend } from 'resend';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);


export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // 🎯 1. New subscription = success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) return new Response("Missing userId metadata", { status: 400 });

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["subscription"],
    });

    const subscription = fullSession.subscription as Stripe.Subscription;

    await prisma.user.update({
      where: { id: userId },
      data: {
        hasSubscription: true,
        stripeCustomerId: fullSession.customer?.toString() ?? null,
        stripeSubscriptionId: subscription?.id ?? null,
      },
    });

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
    
      if (user && user.email) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: user.email,
          subject: "Thank you for subscribing!",
          html: `
            <p>Hi ${user.displayName || user.username || ''},</p>
            <p>Thank you for subscribing to Axiglot!</p>
            <p><strong>Plan:</strong> Monthly Access</p>
            <p><strong>Amount:</strong> £9.99 per month</p>
            <p>You can manage or cancel your subscription anytime by visiting your account settings:</p>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings">Manage Subscription</a></p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Thanks for being part of Axiglot!</p>
          `,
        });
    
        console.log(`Payment confirmation email sent to ${user.email}`);
      }
    }
  
  }

  // 🛑 2. Cancel or expire = revoke access
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;

    const customerId = subscription.customer.toString();
    const status = subscription.status; // "active", "canceled", "incomplete", etc.

    // Lookup user by stripeCustomerId
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      const shouldRevoke =
        status === "canceled" ||
        status === "unpaid" ||
        status === "incomplete_expired" ||
        status === "past_due";

      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasSubscription: !shouldRevoke,
        },
      });
    }
  }

 // ✅ 3. Renewal payment succeeded (fixed version)
 if (event.type === "invoice.paid") {
  const invoice = event.data.object as { subscription?: string | Stripe.Subscription };

  if (invoice.subscription) {
    const subscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;

    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasSubscription: true,
        },
      });
    }
  }
}

// ❌ 4. Payment failed (optional but recommended)
if (event.type === "invoice.payment_failed") {
  const invoice = event.data.object as { subscription?: string | Stripe.Subscription };

  if (invoice.subscription) {
    const subscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;

    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (user && user.email) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Payment Failed - Please Update Your Card",
        html: `
          <p>Hi ${user.displayName || user.username || ''},</p>
          <p>We couldn't process your latest subscription payment. Please update your payment details to keep your access active.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings">Update Payment Method</a></p>
          <p>Thanks!</p>
        `,
      });

      console.log(`Payment failure email sent to ${user.email}`);
    }
  }
}




  return new Response("ok", { status: 200 });
}
