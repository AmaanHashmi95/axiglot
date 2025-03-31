// src/app/(main)/settings/Account.tsx
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "date-fns";

export default async function Account() {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this section.
      </p>
    );
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      createdAt: true,
    },
  });

  if (!userData) {
    return <p>User not found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Account Overview</h2>
      <p className="text-muted-foreground">
        Member since {formatDate(userData.createdAt, "MMM d, yyyy")}
      </p>
    </div>
  );
}
