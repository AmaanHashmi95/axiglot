"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import home from "@/assets/home.png";
import lessons from "@/assets/lessons.png";
import library from "@/assets/My Library.png";
import UserButton from "../users/UserButton";
import menuIcon from "@/assets/Mobile Menu.png";
import tv from "@/assets/TV.png";
import music from "@/assets/Music.png";
import reading from "@/assets/Reading.png";
import audio from "@/assets/AudioLessons.png";
import translator from "@/assets/Translator.png";
import settings from "@/assets/Settings.png";


export default function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="rounded-full p-2 hover:bg-muted"
          aria-label="Open menu"
        >
          <Image src={menuIcon} alt="Menu" width={40} height={40} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-black p-6 shadow-lg">
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <button aria-label="Close menu">
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-6 text-center">
            <Link href="/" className="flex flex-col items-center justify-center gap-1">
              <Image src={home} alt="Home" width={40} height={40} />
              <span className="text-sm">Home</span>
            </Link>

            <Link href="/courses" className="flex flex-col items-center justify-center gap-1">
              <Image src={lessons} alt="Courses" width={40} height={40} />
              <span className="text-sm">Courses</span>
            </Link>

            <Link href="/audio-lessons" className="flex flex-col items-center justify-center gap-1">
              <Image src={audio} alt="Audio Lessons" width={40} height={40} />
              <span className="text-sm">Audio Lessons</span>
            </Link>

            <Link href="/tv" className="flex flex-col items-center justify-center gap-1">
              <Image src={tv} alt="Video" width={40} height={40} />
              <span className="text-sm">Video</span>
            </Link>

            <Link href="/music-lyrics" className="flex flex-col items-center justify-center gap-1">
              <Image src={music} alt="Music" width={40} height={40} />
              <span className="text-sm">Music</span>
            </Link>

            <Link href="/reading" className="flex flex-col items-center justify-center gap-1">
              <Image src={reading} alt="Reading" width={40} height={40} />
              <span className="text-sm">Reading</span>
            </Link>

            <Link href="/bookmarks" className="flex flex-col items-center justify-center gap-1">
              <Image src={library} alt="Bookmarks" width={40} height={40} />
              <span className="text-sm">Bookmarks</span>
            </Link>

            <Link href="/settings" className="flex flex-col items-center justify-center gap-1">
              <Image src={settings} alt="Settings" width={40} height={40} />
              <span className="text-sm">Settings</span>
            </Link>

            <Link href="/profile" className="flex flex-col items-center justify-center gap-1">
              <UserButton className="mx-auto" />
              <span className="text-sm">Profile</span>
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
