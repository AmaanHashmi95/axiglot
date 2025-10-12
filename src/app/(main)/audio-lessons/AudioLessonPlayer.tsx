"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/(main)/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/app/(main)/components/ui/dropdown-menu";
import type { AudioLesson } from "@/lib/audio"; 


export default function AudioLessonPlayer({
  lesson,
  onTimeUpdate,
}: {
  lesson: AudioLesson;
  onTimeUpdate: (time: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bottomPadding, setBottomPadding] = useState(0);

  // OPTIONAL: save lesson progress like your music/video routes
  useEffect(() => {
    if (!lesson?.id) return;
    (async () => {
      try {
        await fetch("/api/audio-lessons/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id }),
        });
      } catch (e) {
        console.error("Failed to save audio lesson progress:", e);
      }
    })();
  }, [lesson?.id]);

  // Reset on lesson change (same as music)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    setIsPlaying(false);
    setCurrentTime(0);
    el.playbackRate = 1;
    setPlaybackRate(1);
  }, [lesson.streamSrc]);

  // Keep player above any bottom menu
  useEffect(() => {
    const adjustBottomPadding = () => {
      const menuBar = document.getElementById("mobile-bottom-menu");
      setBottomPadding(menuBar ? menuBar.offsetHeight : 0);
    };
    adjustBottomPadding();
    window.addEventListener("resize", adjustBottomPadding);
    return () => window.removeEventListener("resize", adjustBottomPadding);
  }, []);

  const canSeekNow = () => {
    const el = audioRef.current;
    return !!el && Number.isFinite(el.duration) && el.duration > 0;
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const seek = (seconds: number) => {
    const el = audioRef.current;
    if (!el || !canSeekNow()) return;
    const dur = el.duration;
    const newTime = Math.max(0, Math.min(el.currentTime + seconds, dur));
    el.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Keep time/duration in sync (capture el for clean add/remove like music)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const updateTime = () => {
      setCurrentTime(el.currentTime);
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      onTimeUpdate(el.currentTime);
    };

    el.addEventListener("timeupdate", updateTime);
    el.addEventListener("loadedmetadata", updateTime);
    el.addEventListener("durationchange", updateTime);

    return () => {
      el.removeEventListener("timeupdate", updateTime);
      el.removeEventListener("loadedmetadata", updateTime);
      el.removeEventListener("durationchange", updateTime);
    };
  }, [onTimeUpdate]);

  // Exact same click + drag seek behavior as MusicPlayer
  const handleSeek = (event: React.MouseEvent | React.TouchEvent) => {
    const bar = progressBarRef.current;
    const el = audioRef.current;
    if (!bar || !el || !canSeekNow()) return;

    const rect = bar.getBoundingClientRect();

    const updateSeek = (e: MouseEvent | TouchEvent) => {
      if (!audioRef.current) return;
      const clientX =
        "touches" in e ? (e.touches as TouchList)[0].clientX : (e as MouseEvent).clientX;
      const offsetX = clientX - rect.left;
      const dur = el.duration;
      const newTime = Math.max(0, Math.min((offsetX / rect.width) * dur, dur));
      el.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const stopSeek = () => {
      document.removeEventListener("mousemove", updateSeek);
      document.removeEventListener("mouseup", stopSeek);
      document.removeEventListener("touchmove", updateSeek);
      document.removeEventListener("touchend", stopSeek);
    };

    // initial jump where the user clicked
    updateSeek(event as unknown as MouseEvent);
    // keep updating while dragging
    document.addEventListener("mousemove", updateSeek);
    document.addEventListener("mouseup", stopSeek);
    document.addEventListener("touchmove", updateSeek);
    document.addEventListener("touchend", stopSeek);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const changeSpeed = (rate: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = rate;
    setPlaybackRate(rate);
  };

  return (
    <div
      className="fixed bottom-0 left-0 flex w-full flex-col items-center border-t bg-white px-4 py-2 shadow-lg"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <audio
  ref={audioRef}
  src={lesson.streamSrc}  // ← use gated route
  controls={false}
  controlsList="nodownload noplaybackrate noremoteplayback"
  preload="auto"
  draggable={false}
  onContextMenu={(e) => e.preventDefault()}
/>

      {/* Controls */}
      <div className="flex w-[400px] max-w-2xl items-center justify-center gap-4">
        {/* Title + Speaker */}
        <div className="flex w-1/4 flex-col truncate text-xs text-gray-800">
          <span className="truncate font-semibold">{lesson.title}</span>
          <span className="truncate">{lesson.speaker}</span>
        </div>

        {/* Rewind */}
        <button onClick={() => seek(-5)}>
          <svg width="32" height="32" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

        {/* Play/Pause */}
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

        {/* Fast Forward */}
        <button onClick={() => seek(5)}>
          <svg width="32" height="32" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

        {/* Speed Control */}
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

      {/* Progress Bar */}
      <div
        ref={progressBarRef}
        className="relative mt-2 h-2 w-full max-w-2xl cursor-pointer rounded-lg bg-gray-200"
        onMouseDown={handleSeek}
        onTouchStart={handleSeek}
      >
        <div
          className="absolute h-2 rounded-lg"
          style={{
            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            background: "linear-gradient(90deg, #ff8a00, #ef2626)",
          }}
        ></div>
      </div>

      {/* Time Display */}
      <p className="mt-1 text-center text-xs text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
