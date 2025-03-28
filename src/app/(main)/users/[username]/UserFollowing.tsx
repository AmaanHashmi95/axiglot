import prisma from "@/lib/prisma";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import FollowButtonWrapper from "@/components/FollowButtonWrapper"; // ← add this

interface Props {
  userId: string;
}

export default async function UserFollowing({ userId }: Props) {
  const following = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (following.length === 0) {
    return <p className="text-muted-foreground">You’re not following anyone yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {following.map(({ following }) => (
        <div
          key={following.id}
          className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
        >
          <Link href={`/users/${following.username}`} className="flex items-center gap-4">
            <UserAvatar avatarUrl={following.avatarUrl} size={50} />
            <div>
              <div className="font-medium">{following.displayName}</div>
              <div className="text-sm text-muted-foreground">@{following.username}</div>
            </div>
          </Link>
          <FollowButtonWrapper userId={following.id} />
        </div>
      ))}
    </div>
  );
}
