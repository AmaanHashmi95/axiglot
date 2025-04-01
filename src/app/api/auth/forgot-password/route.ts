import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user || !user.id) {
    return NextResponse.json({ message: "If email exists, reset link was sent." });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: expires,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  // TODO: Replace with your mail service (SendGrid, Resend, etc.)
  console.log("🔗 Reset Link:", resetUrl);

  return NextResponse.json({ message: "If email exists, reset link was sent. Please close this screen." });
}
