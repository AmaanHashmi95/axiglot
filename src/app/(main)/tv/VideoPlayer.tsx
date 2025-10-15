"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // ⬅️ useCallback
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
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      videoRef.current.playbackRate = 1;
      setPlaybackRate(1);
    }
  }, [video.streamSrc, videoRef]); // ⬅️ include videoRef

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const seek = (seconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    const newTime = Math.max(0, Math.min(el.currentTime + seconds, duration));
    el.currentTime = newTime;
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

  useEffect(() => {
    const el = videoRef.current; // ⬅️ snapshot
    if (!el) return;

    const updateTime = () => {
      setCurrentTime(el.currentTime);
      setDuration(el.duration || 0);
      onTimeUpdate(el.currentTime);
    };

    el.addEventListener("timeupdate", updateTime);
    el.addEventListener("loadedmetadata", updateTime);

    return () => {
      el.removeEventListener("timeupdate", updateTime);
      el.removeEventListener("loadedmetadata", updateTime);
    };
  }, [onTimeUpdate, videoRef]);

  const handleSeek = (event: React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const bar = progressBarRef.current;
    const rect = bar.getBoundingClientRect();

    const getClientX = (e: React.MouseEvent | React.TouchEvent) =>
      "touches" in e ? e.touches[0].clientX : e.clientX;

    const updateSeek = (e: MouseEvent | TouchEvent) => {
      if (!videoRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const offsetX = clientX - rect.left;
      const newTime = Math.max(
        0,
        Math.min((offsetX / rect.width) * duration, duration),
      );
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const stopSeek = () => {
      document.removeEventListener("mousemove", updateSeek);
      document.removeEventListener("mouseup", stopSeek);
      document.removeEventListener("touchmove", updateSeek);
      document.removeEventListener("touchend", stopSeek);
    };

    updateSeek(event as unknown as MouseEvent); // Update on first click/touch
    document.addEventListener("mousemove", updateSeek);
    document.addEventListener("mouseup", stopSeek);
    document.addEventListener("touchmove", updateSeek);
    document.addEventListener("touchend", stopSeek);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleBackToChooser = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setSelectedVideo(null);
    setShowSubtitles(false);
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
  

  return (
    <div
      className="fixed bottom-0 left-0 flex w-full flex-col items-center border-t bg-white px-4 py-2 shadow-lg"
      style={{ bottom: `${bottomPadding}px` }}
    >
      {/* ✅ Player Controls with Corrected Icons */}
      <div className="flex w-full max-w-2xl items-center justify-center gap-4">
        {/* Video Title & Genre (Left) */}
        <div className="flex w-1/4 flex-col truncate text-xs text-gray-800">
          <span className="truncate font-semibold">{video.title}</span>
          <span className="truncate">{video.genre}</span>
        </div>

        {/* Subtitles Button (Left of Rewind) */}
        <Button
              onClick={onBack}
              className="rounded-md bg-gray-700 px-3 py-2 text-white shadow"
            >
              ← Back
            </Button>

        {/* Video Controls (Perfectly Centered) */}
        <div className="left-1/10 relative flex w-[300px] items-center gap-4">
          {/* ✅ Corrected Rewind Button (Double Left Arrow) */}
          <button onClick={() => seek(-5)}>
            <svg width="32" height="32" viewBox="0 0 24 24">
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ff8a00" />
                  <stop offset="100%" stopColor="#ef2626" />
                </linearGradient>
              </defs>
              <path
                fill="url(#gradient)"
                d="M11 12L22 22V2zM2 12L13 22V2z"
              ></path>
            </svg>
          </button>

          {/* ✅ Play/Pause Button (Bigger Size) */}
          <button onClick={togglePlay}>
            <svg width="50" height="50" viewBox="0 0 24 24">
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
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

          {/* ✅ Corrected Fast Forward Button (Double Right Arrow) */}
          <button onClick={() => seek(5)}>
            <svg width="32" height="32" viewBox="0 0 24 24">
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ff8a00" />
                  <stop offset="100%" stopColor="#ef2626" />
                </linearGradient>
              </defs>
              <path
                fill="url(#gradient)"
                d="M13 12L2 22V2zM22 12L11 22V2z"
              ></path>
            </svg>
          </button>
        </div>

        {/* ✅ Speed Toggle (Resets on Video Change) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="px-3 py-1 text-xs">
              Speed: {playbackRate}x ⏷
            </Button>
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

      {/* ✅ Progress Bar */}
      <div
        ref={progressBarRef}
        className="relative mt-2 h-2 w-full max-w-2xl cursor-pointer rounded-lg bg-gray-200"
        onMouseDown={handleSeek}
        onTouchStart={handleSeek}
      >
        <div
          className="absolute h-2 rounded-lg bg-blue-500"
          style={{
            width: `${(currentTime / duration) * 100}%`,
            background: "linear-gradient(90deg, #ff8a00, #ef2626)",
          }}
        ></div>
      </div>

      {/* ✅ Centered Time Display */}
      <p className="mt-1 text-center text-xs text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
