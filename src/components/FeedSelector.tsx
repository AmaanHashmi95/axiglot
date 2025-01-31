"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import ForYouFeed from "@/app/(main)/ForYouFeed";
import FollowingFeed from "@/app/(main)/FollowingFeed";

const FEEDS = [
  { key: "for-you", label: "For You", component: <ForYouFeed /> },
  { key: "following", label: "Following", component: <FollowingFeed /> },
];

export default function FeedSelector() {
  const [selectedFeed, setSelectedFeed] = useState(FEEDS[0]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-card p-2 rounded-md shadow-sm">
        <span className="text-lg font-bold">{selectedFeed.label}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 bg-background rounded-md text-muted-foreground hover:bg-muted transition">
              {selectedFeed.label} <ChevronDown className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {FEEDS.map((feed) => (
              <DropdownMenuItem key={feed.key} onClick={() => setSelectedFeed(feed)}>
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