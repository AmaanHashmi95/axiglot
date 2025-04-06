import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found or missing email' }, { status: 400 });
    }

    // ✅ Mark user as subscribed now
    const subscription = session.subscription as Stripe.Subscription;
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasSubscription: true,
        stripeCustomerId: session.customer?.toString() ?? null,
        stripeSubscriptionId: subscription?.id ?? null,
      },
    });

    // ✅ Already sent?
    const existing = await prisma.emailVerificationToken.findFirst({ where: { userId } });
    if (existing) {
      return NextResponse.json({ message: 'Already sent' });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: user.email,
      subject: 'Verify your email',
      html: `
        <p>Thanks for subscribing! Click below to verify your email:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      `,
    });

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
