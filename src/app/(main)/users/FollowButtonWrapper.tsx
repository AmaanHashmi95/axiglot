"use client";

import FollowButton from "./FollowButton";
import { FollowerInfo } from "@/lib/types";

interface FollowButtonWrapperProps {
  userId: string;
}

export default function FollowButtonWrapper({ userId }: FollowButtonWrapperProps) {
  const initialState: FollowerInfo = {
    followers: 0,
    isFollowedByUser: true, // they’re in the “following” list so we assume true
  };

  return <FollowButton userId={userId} initialState={initialState} />;
}
