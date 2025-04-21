// File: src/app/(auth)/signup/actions.ts
"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUserByEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingUserByEmail) {
      if (existingUserByEmail.hasSubscription) {
        return { error: "Email already taken" };
      }

      if (
        existingUserByEmail.username.toLowerCase() !== username.toLowerCase()
      ) {
        return {
          error:
            "Account already exists. Please log in or use the original username.",
        };
      }

      const checkoutRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: existingUserByEmail.id,
            email,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const { url } = await checkoutRes.json();
      return redirect(url);
    }

    const existingUserByUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUserByUsername) {
      return { error: "Username already taken" };
    }

    await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },
    });

    await streamServerClient.upsertUser({
      id: userId,
      username,
      name: username,
    });

    const checkoutRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create-checkout-session`,
      {
        method: "POST",
        body: JSON.stringify({ userId, email }),
        headers: { "Content-Type": "application/json" },
      },
    );

    const { url } = await checkoutRes.json();
    return redirect(url);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
