// File: src/app/api/stripe/create-customer-portal-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
