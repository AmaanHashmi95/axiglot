"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/app/(main)/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/app/(main)/components/ui/dropdown-menu";
import type { Video } from "@/lib/video";

export default function VideoPlayer({
  video,
  onTimeUpdate,
  showSubtitles,
  setShowSubtitles,
  videoRef,
  onBack,
}: {
  video: Video;
  onTimeUpdate: (time: number) => void;
  showSubtitles: boolean;
  setShowSubtitles: (state: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  onBack: () => void;
}) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bottomPadding, setBottomPadding] = useState(0);

  // ✅ Sync state from media events (avoids extra .load() churn)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onLoaded = () => {
      setDuration(el.duration || 0);
      setCurrentTime(el.currentTime || 0);
      setIsPlaying(!el.paused);
    };
    const onTime = () => {
      setCurrentTime(el.currentTime);
      onTimeUpdate(el.currentTime);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [onTimeUpdate, videoRef]);

  // ✅ Reset playbackRate UI on video change (no forced reload)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = 1;
    setPlaybackRate(1);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [video.streamSrc, videoRef]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
    } else {
      el.play().catch(console.error);
    }
  };

  const seekRelative = (seconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    const d = Number.isFinite(el.duration) ? el.duration : duration;
    const newTime = Math.max(0, Math.min(el.currentTime + seconds, d || 0));
    if (typeof (el as any).fastSeek === "function") (el as any).fastSeek(newTime);
    else el.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (rate: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const adjustBottomPadding = useCallback(() => {
    const menuBar = document.getElementById("mobile-bottom-menu");
    setBottomPadding(menuBar ? menuBar.offsetHeight : 0);
  }, []);

  useEffect(() => {
    adjustBottomPadding();
    window.addEventListener("resize", adjustBottomPadding);
    return () => window.removeEventListener("resize", adjustBottomPadding);
  }, [adjustBottomPadding]);

  // ✅ Throttled scrubbing to avoid Range-request storms
  const rafId = useRef<number | null>(null);
  const pendingTime = useRef<number | null>(null);

  const commitSeek = useCallback(
    (t: number) => {
      pendingTime.current = t;
      if (rafId.current != null) return;

      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        const el = videoRef.current;
        const next = pendingTime.current;
        pendingTime.current = null;
        if (!el || next == null) return;

        if (typeof (el as any).fastSeek === "function") (el as any).fastSeek(next);
        else el.currentTime = next;

        setCurrentTime(next);
      });
    },
    [videoRef]
  );

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleSeekStart = (event: React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const bar = progressBarRef.current;

    const getClientX = (e: React.MouseEvent | React.TouchEvent) =>
      "touches" in e ? e.touches[0].clientX : e.clientX;

    const computeTimeFromClientX = (clientX: number) => {
      const rect = bar.getBoundingClientRect();
      const d = Number.isFinite(videoRef.current?.duration)
        ? (videoRef.current?.duration as number)
        : duration;

      const offsetX = clientX - rect.left;
      const ratio = rect.width > 0 ? offsetX / rect.width : 0;
      return Math.max(0, Math.min(ratio * (d || 0), d || 0));
    };

    const move = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      commitSeek(computeTimeFromClientX(clientX));
    };

    const stop = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", stop);
    };

    // initial
    commitSeek(computeTimeFromClientX(getClientX(event)));

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", stop);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    async function saveVideoProgress() {
      if (!video.id) return;
      try {
        await fetch("/api/video/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: video.id }),
        });
      } catch (error) {
        console.error("Failed to save video progress:", error);
      }
    }
    saveVideoProgress();
  }, [video.id]);

  const safePct =
    duration > 0 && Number.isFinite(duration) ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className="fixed bottom-0 left-0 flex w-full flex-col items-center border-t bg-white px-4 py-2 shadow-lg"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <div className="flex w-full max-w-2xl items-center justify-center gap-4">
        <div className="flex w-1/4 flex-col truncate text-xs text-gray-800">
          <span className="truncate font-semibold">{video.title}</span>
          <span className="truncate">{video.genre}</span>
        </div>

        <Button onClick={onBack} className="rounded-md bg-gray-700 px-3 py-2 text-white shadow">
          ← Back
        </Button>

        <div className="left-1/10 relative flex w-[300px] items-center gap-4">
          <button onClick={() => seekRelative(-5)}>
            <svg width="32" height="32" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8a00" />
                  <stop offset="100%" stopColor="#ef2626" />
                </linearGradient>
              </defs>
              <path fill="url(#gradient)" d="M11 12L22 22V2zM2 12L13 22V2z"></path>
            </svg>
          </button>

          <button onClick={togglePlay}>
            <svg width="50" height="50" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8a00" />
                  <stop offset="100%" stopColor="#ef2626" />
                </linearGradient>
              </defs>
              <path
                fill="url(#gradient)"
                d={isPlaying ? "M6 19h4V5H6zm8-14v14h4V5z" : "M8 5v14l11-7z"}
              ></path>
            </svg>
          </button>

          <button onClick={() => seekRelative(5)}>
            <svg width="32" height="32" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8a00" />
                  <stop offset="100%" stopColor="#ef2626" />
                </linearGradient>
              </defs>
              <path fill="url(#gradient)" d="M13 12L2 22V2zM22 12L11 22V2z"></path>
            </svg>
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="px-3 py-1 text-xs">Speed: {playbackRate}x ⏷</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[1, 0.75, 0.5, 0.25].map((speed) => (
              <DropdownMenuItem key={speed} onClick={() => changeSpeed(speed)}>
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={progressBarRef}
        className="relative mt-2 h-2 w-full max-w-2xl cursor-pointer rounded-lg bg-gray-200"
        onMouseDown={handleSeekStart}
        onTouchStart={handleSeekStart}
      >
        <div
          className="absolute h-2 rounded-lg bg-blue-500"
          style={{
            width: `${safePct}%`,
            background: "linear-gradient(90deg, #ff8a00, #ef2626)",
          }}
        ></div>
      </div>

      <p className="mt-1 text-center text-xs text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}