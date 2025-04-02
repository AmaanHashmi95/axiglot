import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 400 });
  }

  const found = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!found || found.expiresAt < new Date()) {
    return NextResponse.json({ message: "Token invalid or expired" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: found.userId },
    data: { emailVerified: true },
  });

  await prisma.emailVerificationToken.delete({ where: { token } });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?verified=true`);
}
