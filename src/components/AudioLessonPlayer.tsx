"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AudioLesson {
  id: string;
  title: string;
  speaker: string;
  audioUrl: string;
}

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      audioRef.current.playbackRate = 1;
      setPlaybackRate(1);
    }
  }, [lesson.audioUrl]);

  useEffect(() => {
    const adjustBottomPadding = () => {
      const menuBar = document.getElementById("mobile-bottom-menu");
      setBottomPadding(menuBar ? menuBar.offsetHeight : 0);
    };

    adjustBottomPadding();
    window.addEventListener("resize", adjustBottomPadding);
    return () => window.removeEventListener("resize", adjustBottomPadding);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      }
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(
      0,
      Math.min(audioRef.current.currentTime + seconds, duration),
    );
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
        onTimeUpdate(audioRef.current.currentTime);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", updateTime);
      audioRef.current.addEventListener("loadedmetadata", updateTime);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateTime);
        audioRef.current.removeEventListener("loadedmetadata", updateTime);
      }
    };
  }, [onTimeUpdate]);

  const handleSeek = (event: React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const offsetX = clientX - rect.left;
    const newTime = Math.max(
      0,
      Math.min((offsetX / rect.width) * duration, duration),
    );
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const changeSpeed = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 flex w-full flex-col items-center border-t bg-white px-4 py-2 shadow-lg"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <audio
        ref={audioRef}
        src={`/api/media?id=${lesson.audioUrl}`}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => setIsPlaying(false)}
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
            width: `${(currentTime / duration) * 100}%`,
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
