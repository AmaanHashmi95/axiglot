"use server";


import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function login(
 credentials: LoginValues,
): Promise<{ error: string }> {
 try {
   const { username, password } = loginSchema.parse(credentials);


   const user = await prisma.user.findFirst({
     where: {
       username: {
         equals: username,
         mode: "insensitive",
       },
     },
   });


   if (!user || !user.passwordHash) {
     return { error: "Incorrect username or password" };
   }


   const isValid = await verify(user.passwordHash, password, {
     memoryCost: 19456,
     timeCost: 2,
     outputLen: 32,
     parallelism: 1,
   });


   if (!isValid) {
     return { error: "Incorrect username or password" };
   }


   if (!user.emailVerified || !user.hasSubscription) {
     return { error: "You must verify your email and complete your subscription before logging in." };
   }


   const session = await lucia.createSession(user.id, {});
   const sessionCookie = lucia.createSessionCookie(session.id);


   cookies().set(
     sessionCookie.name,
     sessionCookie.value,
     sessionCookie.attributes,
   );


   return redirect("/");
 } catch (error) {
   if (isRedirectError(error)) throw error;
   console.error(error);
   return { error: "Something went wrong. Please try again." };
 }
}


