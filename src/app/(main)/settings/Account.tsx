import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "date-fns";
import EditProfileForm from "./EditProfileForm";
import LogoutButton from "@/app/(main)/settings/LogoutButton";

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
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      username: true,
    },
  });

  if (!userData) {
    return <p>User not found.</p>;
  }

  return (
    <div>
      <EditProfileForm user={userData} />

      <p className="text-muted-foreground mt-4">
        Member since {formatDate(userData.createdAt, "MMM d, yyyy")}
      </p>

      <LogoutButton />
    </div>
  );
}
