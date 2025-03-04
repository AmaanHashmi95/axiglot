"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface Song {
  title: string;
  artist: string;
  youtubeUrl: string;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
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
  const playerRef = useRef<any>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bottomPadding, setBottomPadding] = useState(0);

  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onload = () => {
        if (window.YT) {
          window.onYouTubeIframeAPIReady?.();
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!song.youtubeUrl) return;

    const initializePlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player("youtube-audio", {
        videoId: song.youtubeUrl,
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          mute: 1, // ✅ Ensures Safari allows autoplay
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setDuration(event.target.getDuration());
            setCurrentTime(event.target.getCurrentTime());
            event.target.setPlaybackRate(playbackRate);

            // ✅ Unmute for Safari after user interaction
            setTimeout(() => {
              event.target.unMute();
            }, 500);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }
  }, [song.youtubeUrl, playbackRate]); // ✅ Fix: Added playbackRate

  const togglePlay = () => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (seconds: number) => {
    if (
      playerRef.current &&
      isPlayerReady &&
      typeof playerRef.current.getCurrentTime === "function"
    ) {
      const newTime = Math.max(0, playerRef.current.getCurrentTime() + seconds);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const changeSpeed = (rate: number) => {
    if (playerRef.current && isPlayerReady) {
      const currentVideoTime = playerRef.current.getCurrentTime();
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
      playerRef.current.seekTo(currentVideoTime, true);
    }
  };

  // ✅ Adjust for mobile bottom menu bar
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
    const interval = setInterval(() => {
      if (
        playerRef.current &&
        isPlayerReady &&
        !isSeeking &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate(time);
        setDuration(playerRef.current.getDuration());
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerReady, isSeeking, onTimeUpdate]);

  const handleSeek = (event: React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current || !playerRef.current || !isPlayerReady) return;

    const bar = progressBarRef.current;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    const offsetX = clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;

    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 border-t flex flex-col items-center transition-all"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <h2 className="text-xl font-bold">
        {song.title} - {song.artist}
      </h2>
      <div id="youtube-audio" className="pointer-events-none absolute opacity-0"></div>

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
      <Button className="mt-4 bg-blue-600 text-white" onClick={() => setShowLyrics(!showLyrics)}>
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
