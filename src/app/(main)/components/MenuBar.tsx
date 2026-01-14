import { validateRequest } from "@/auth";
import { Button } from "@/app/(main)/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import home from "@/assets/home.png";
import lessons from "@/assets/lessons.png";
import library from "@/assets/My Library.png";
import tv from "@/assets/TV.png";
import music from "@/assets/Music.png";
import reading from "@/assets/Reading.png";
import audio from "@/assets/AudioLessons.png";
import translator from "@/assets/Translator.png";
import settings from "@/assets/Settings.png";
import UserButton from "../users/UserButton";

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
        title="Learn on the Go"
        asChild
      >
        <Link href="/audio-lessons">
          <Image
            src={audio} // Add your image in the public/icons directory
            alt="Audio Lessons"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Audio Lessons</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="TV"
        asChild
      >
        <Link href="/tv">
          <Image
            src={tv} // Add your image in the public/icons directory
            alt="Video"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Video</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Music"
        asChild
      >
        <Link href="/music-lyrics">
          <Image
            src={music} // Add your image in the public/icons directory
            alt="Music"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Music</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Reading"
        asChild
      >
        <Link href="/reading">
          <Image
            src={reading} // Add your image in the public/icons directory
            alt="Reading"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Reading</span>
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

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Settings"
        asChild
      >
        <Link href="/settings">
          <Image
            src={settings} // Add your image in the public/icons directory
            alt="Home"
            width={32}
            height={32}
          />
          <span className="hidden lg:inline">Settings</span>
        </Link>
      </Button>

      <div className="flex items-center justify-start gap-3 rounded-md px-4 py-2 hover:bg-muted">
        <UserButton />
        <span className="hidden lg:inline">Profile</span>
      </div>
    </div>
  );
}
