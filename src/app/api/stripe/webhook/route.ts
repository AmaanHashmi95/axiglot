import { NextRequest } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      return new Response("Missing userId metadata", { status: 400 });
    }

    // Expand session to get subscription ID
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
  }

  return new Response("ok", { status: 200 });
}
