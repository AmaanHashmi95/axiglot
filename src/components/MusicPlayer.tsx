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
  const [isSeeking, setIsSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bottomPadding, setBottomPadding] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // Ensure the new song is loaded properly
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [song.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((error) => console.error("Playback failed:", error));
        }
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
    } else {
      console.warn("Audio element is not available to change speed.");
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
      className="fixed bottom-0 left-0 flex w-full flex-col items-center border-t bg-white p-4 shadow-lg transition-all"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <h2 className="text-xl font-bold">
        {song.title} - {song.artist}
      </h2>

      {/* ✅ Audio Element for Playing Music */}
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            onTimeUpdate(audioRef.current.currentTime);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={() => seek(-5)}>⏪</Button>
        <Button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</Button>
        <Button onClick={() => seek(5)}>⏩</Button>
      </div>

      {/* ✅ Speed Toggle Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="mt-4">Speed: {playbackRate}x ⏷</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[1, 0.75, 0.5, 0.25].map((speed) => (
            <DropdownMenuItem key={speed} onClick={() => changeSpeed(speed)}>
              {speed}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ✅ Lyrics/Songs Toggle Button */}
      <Button
        className="mt-4 bg-blue-600 text-white"
        onClick={() => setShowLyrics(!showLyrics)}
      >
        {showLyrics ? "Show Songs" : "Show Lyrics"}
      </Button>

      {/* ✅ Movable Progress Bar (Clickable & Draggable) */}
      <div
        ref={progressBarRef}
        className="relative mt-2 flex h-2 w-full cursor-pointer items-center rounded-lg bg-gray-200"
        onMouseDown={(e) => handleSeek(e)}
        onTouchStart={(e) => handleSeek(e)}
      >
        <div
          className="absolute h-2 rounded-lg bg-blue-500"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>

      {/* ✅ Time Display */}
      <p className="mt-2 text-center text-sm text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
