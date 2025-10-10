"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Linkify from "../Linkify";
import UserAvatar from "@/app/(main)/users//UserAvatar";
import UserTooltip from "@/app/(main)/users/UserTooltip";
import BookmarkButton from "./BookmarkButton";
import PostMoreButton from "./PostMoreButton";


interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-5">
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">
        <p>{post.content}</p>
        </div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <div className="flex justify-between gap-5">
        
      </div>
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: { media: Media }) {
  if (media.type === "IMAGE") {
    return (
      <div
        className="relative mx-auto w-full rounded-2xl"
        style={{ height: "min(30rem, 80vh)" }} // gives the fill image a box to live in
      >
        <Image
          src={media.url}
          alt="Attachment"
          fill
          unoptimized        // skip Next’s optimizer since these are blob URLs
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-contain rounded-2xl"
          priority={false}
        />
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return <FeedVideo src={media.url} />;
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

/** Minimal, inline, no-download feed video */
function FeedVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pause when out of view
  useEffect(() => {
    const el = containerRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting && !vid.paused) {
          vid.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Stop other videos when this one plays
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<HTMLVideoElement>).detail;
      if (!videoRef.current) return;
      if (detail !== videoRef.current) {
        // Another video started playing; pause this one
        if (!videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    document.addEventListener("axiglot-stop-other-videos", handler as EventListener);
    return () =>
      document.removeEventListener("axiglot-stop-other-videos", handler as EventListener);
  }, []);

  const togglePlay = async () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      // Signal others to stop
      document.dispatchEvent(
        new CustomEvent("axiglot-stop-other-videos", { detail: vid })
      );
      try {
        await vid.play();
        setIsPlaying(true);
      } catch {
        // ignore play rejection
      }
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full rounded-2xl"
      style={{ height: "min(30rem, 80vh)" }}
    >
      {/* Top-left tiny play/pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute left-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1 text-xs text-white"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <video
        ref={videoRef}
        src={src}
        // No native controls -> no seekbar/speed/download UI
        controls={false}
        // Inline on mobile (avoid fullscreen)
        playsInline
        webkit-playsinline="true"
        // Deter downloads / extra UI
        disablePictureInPicture
        controlsList="nofullscreen noremoteplayback nodownload noplaybackrate"
        // Keep aspect ratio contained
        className="h-full w-full rounded-2xl object-contain"
        // Don’t show context menu (basic deterrent)
        onContextMenu={(e) => e.preventDefault()}
        // Safari iOS sometimes respects muted on first interaction; we let user toggle via custom button,
        // but keeping it unmuted by default here:
        preload="metadata"
      />
    </div>
  );
}