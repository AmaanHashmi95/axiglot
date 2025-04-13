import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home } from "lucide-react";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import Image from "next/image";
import home from "@/assets/home.png";
import lessons from "@/assets/lessons.png";
import library from "@/assets/library.png";
import UserButton from "@/components/UserButton";

interface MenuBarProps {
  className?: string;
  id?: string;
}

export default async function MenuBar({ className, id }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className} id={id}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Image
            src={home} // Add your image in the public/icons directory
            alt="Home"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Courses"
        asChild
      >
        <Link href="/courses">
          <Image
            src={lessons} // Add your image in the public/icons directory
            alt="Courses"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Courses</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Image
            src={library} // Add your image in the public/icons directory
            alt="Home"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>

      <div className="flex items-center justify-start gap-3 rounded-md px-4 py-2 hover:bg-muted">
        <UserButton />
        <span className="hidden lg:inline">Profile</span>
      </div>
    </div>
  );
}
