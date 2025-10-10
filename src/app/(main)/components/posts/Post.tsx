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
  const [muted, setMuted] = useState(false);

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

  const toggleMuted = () => {
    setMuted((m) => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full rounded-2xl overflow-hidden bg-black"
      style={{ height: "min(30rem, 80vh)" }}
    >
      {/* Play / Pause (top-left) */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute left-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? (
          // Pause icon
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        ) : (
          // Play icon
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Audio on/off (top-right) — local only */}
      <button
        type="button"
        onClick={toggleMuted}
        className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? (
          // Muted icon (speaker with X)
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 9H5v6h4l5 4V5L9 9z" fill="currentColor" />
            <path d="M19 5l-3 3M16 16l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          // Volume icon (speaker with waves)
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 9H5v6h4l5 4V5L9 9z" fill="currentColor" />
            <path d="M16 8c1.2 1 1.8 2.3 1.8 4s-.6 3-1.8 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <video
        ref={videoRef}
        src={src}
        controls={false}                       // no native UI
        playsInline
        webkit-playsinline="true"              // iOS inline
        preload="auto"                         // draw first frame on load
        muted={muted}                          // per-video mute only
        disablePictureInPicture
        controlsList="nofullscreen noremoteplayback nodownload noplaybackrate"
        className="z-10 h-full w-full rounded-2xl object-contain"
        onContextMenu={(e) => e.preventDefault()} // deter downloads
        onPlay={() => {
          const vid = videoRef.current;
          if (vid) {
            document.dispatchEvent(new CustomEvent("axiglot-stop-other-videos", { detail: vid }));
            setIsPlaying(true);
          }
        }}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}