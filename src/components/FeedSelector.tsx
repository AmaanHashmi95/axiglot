"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import ForYouFeed from "@/app/(main)/ForYouFeed";
import FollowingFeed from "@/app/(main)/FollowingFeed";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";

const FEEDS = [
  { key: "for-you", label: "For You", icon: india, component: <ForYouFeed /> },
  { key: "following", label: "Following", icon: pakistan, component: <FollowingFeed /> },
];

export default function FeedSelector() {
  const [selectedFeed, setSelectedFeed] = useState(FEEDS[0]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-card p-3 rounded-md shadow-sm">
        <div className="flex items-center gap-2">
          <Image src={selectedFeed.icon} alt={selectedFeed.label} width={24} height={24} className="w-6 h-6 object-contain" />
          <span className="text-lg font-bold">{selectedFeed.label}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 bg-background rounded-md text-muted-foreground hover:bg-muted transition">
              <Image src={selectedFeed.icon} alt={selectedFeed.label} width={20} height={20} className="w-5 h-5 object-contain" />
              {selectedFeed.label} <ChevronDown className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {FEEDS.map((feed) => (
              <DropdownMenuItem
                key={feed.key}
                onClick={() => setSelectedFeed(feed)}
                className="flex items-center gap-2"
              >
                <Image src={feed.icon} alt={feed.label} width={20} height={20} className="w-5 h-5 object-contain" />
                {feed.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {selectedFeed.component}
    </div>
  );
}