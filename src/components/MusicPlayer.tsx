"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Song {
  title: string;
  artist: string;
  audioUrl: string;
}

export default function MusicPlayer({
  song,
  onTimeUpdate,
  showLyrics,
  setShowLyrics,
}: {
  song: Song;
  onTimeUpdate: (time: number) => void;
  showLyrics: boolean;
  setShowLyrics: (state: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1); // ✅ Speed defaults to 1x
  const [bottomPadding, setBottomPadding] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);

      // ✅ Reset speed to 1x when changing the song
      audioRef.current.playbackRate = 1;
      setPlaybackRate(1);
    }
  }, [song.audioUrl]); // ✅ Trigger this when a new song is loaded

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const changeSpeed = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  useEffect(() => {
    const adjustBottomPadding = () => {
      const menuBar = document.getElementById("mobile-bottom-menu");
      setBottomPadding(menuBar ? menuBar.offsetHeight : 0);
    };

    adjustBottomPadding();
    window.addEventListener("resize", adjustBottomPadding);
    return () => window.removeEventListener("resize", adjustBottomPadding);
  }, []);

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

    const bar = progressBarRef.current;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    const offsetX = clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full flex flex-col items-center border-t bg-white px-4 py-2 shadow-lg"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            onTimeUpdate(audioRef.current.currentTime);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* ✅ Player Controls with Corrected Icons */}
      <div className="flex items-center justify-center w-full max-w-2xl gap-4">
        {/* Song Title & Artist (Left) */}
        <div className="flex flex-col text-xs text-gray-800 truncate w-1/4">
          <span className="font-semibold truncate">{song.title}</span>
          <span className="truncate">{song.artist}</span>
        </div>

        {/* Lyrics Button (Left of Rewind) */}
        <Button
          className="bg-blue-600 text-white px-2 py-1 text-xs"
          onClick={() => setShowLyrics(!showLyrics)}
          style={{ minWidth: "60px" }}
        >
          {showLyrics ? "Songs" : "Lyrics"}
        </Button>

        {/* Music Controls (Perfectly Centered) */}
        <div className="flex items-center gap-4 relative w-[300px] left-1/10">
          {/* ✅ Corrected Rewind Button (Double Left Arrow) */}
<button onClick={() => seek(-5)}>
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

{/* ✅ Play/Pause Button (Bigger Size) */}
<button onClick={togglePlay}>
  <svg width="50" height="50" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff8a00" />
        <stop offset="100%" stopColor="#ef2626" />
      </linearGradient>
    </defs>
    <path fill="url(#gradient)" d={isPlaying ? "M6 19h4V5H6zm8-14v14h4V5z" : "M8 5v14l11-7z"}></path>
  </svg>
</button>

{/* ✅ Corrected Fast Forward Button (Double Right Arrow) */}
<button onClick={() => seek(5)}>
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

        {/* ✅ Speed Toggle (Resets on Song Change) */}
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

      {/* ✅ Progress Bar */}
      <div
        ref={progressBarRef}
        className="relative mt-2 w-full h-2 cursor-pointer rounded-lg bg-gray-200 max-w-2xl"
        onMouseDown={handleSeek}
        onTouchStart={handleSeek}
      >
        <div
          className="absolute h-2 rounded-lg bg-blue-500"
          style={{ width: `${(currentTime / duration) * 100}%`,
          background: "linear-gradient(90deg, #ff8a00, #ef2626)",}}
        ></div>
      </div>

      {/* ✅ Centered Time Display */}
      <p className="mt-1 text-center text-xs text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
