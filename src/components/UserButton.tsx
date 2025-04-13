"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();

  return (
    <Link
      href={`/users/${user.username}`}
      className={cn("flex-none rounded-full", className)}
    >
      <UserAvatar avatarUrl={user.avatarUrl} size={32} />
    </Link>
  );
}
