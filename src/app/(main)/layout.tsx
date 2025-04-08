// src/app/(main)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import MenuBar from "./MenuBar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) {
    redirect("/login");
  }

  // ✅ Fetch FRESH data from DB to avoid stale caching
  const [dbUser] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        hasSubscription: true,
        emailVerified: true,
      },
    }),
  ]);

  console.log("🔒 Access Check — Subscription:", dbUser?.hasSubscription, "Email Verified:", dbUser?.emailVerified);

  if (!dbUser?.hasSubscription || !dbUser?.emailVerified) {
    redirect("/login");
  }

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-50" />
          {children}
        </div>
        <MenuBar
          className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden"
          id="mobile-bottom-menu"
        />
      </div>
    </SessionProvider>
  );
}
