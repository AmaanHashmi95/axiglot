"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

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
  setShowLyrics 
}: { 
  song: Song; 
  onTimeUpdate: (time: number) => void; 
  showLyrics: boolean; 
  setShowLyrics: (state: boolean) => void;
}) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bottomPadding, setBottomPadding] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false); // ✅ Track if user is moving progress bar

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
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setDuration(event.target.getDuration());
            setCurrentTime(0);
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
  }, [song.youtubeUrl]);

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
    if (playerRef.current && isPlayerReady && typeof playerRef.current.getCurrentTime === "function") {
      const newTime = Math.max(0, playerRef.current.getCurrentTime() + seconds);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlayerReady && !isSeeking && typeof playerRef.current.getCurrentTime === "function") {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate(time); 
        setDuration(playerRef.current.getDuration());
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerReady, isSeeking, onTimeUpdate]);

  useEffect(() => {
    const adjustBottomPadding = () => {
      const menuBar = document.getElementById("mobile-bottom-menu");
      setBottomPadding(menuBar ? menuBar.offsetHeight : 0);
    };

    adjustBottomPadding();
    window.addEventListener("resize", adjustBottomPadding);
    return () => window.removeEventListener("resize", adjustBottomPadding);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // ✅ Handle progress bar click
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!playerRef.current || !isPlayerReady || !duration) return;

    const bar = event.currentTarget;
    const clickX = event.nativeEvent.offsetX;
    const barWidth = bar.clientWidth;
    const newTime = (clickX / barWidth) * duration;

    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  // ✅ Handle progress bar drag
  const handleProgressBarDrag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isSeeking || !playerRef.current || !isPlayerReady || !duration) return;

    const bar = event.currentTarget;
    const clickX = event.nativeEvent.offsetX;
    const barWidth = bar.clientWidth;
    const newTime = (clickX / barWidth) * duration;

    setCurrentTime(newTime);
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 border-t flex flex-col items-center transition-all"
      style={{ bottom: `${bottomPadding}px` }}
    >
      <h2 className="text-xl font-bold">{song.title} - {song.artist}</h2>
      <div id="youtube-audio" className="absolute opacity-0 pointer-events-none"></div>

      <div className="flex items-center gap-2 mt-4">
        <Button onClick={() => seek(-5)}>⏪</Button>
        <Button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</Button>
        <Button onClick={() => seek(5)}>⏩</Button>
      </div>

      {/* ✅ Toggle Lyrics/Songs Button */}
      <Button 
        className="mt-4 px-4 py-2 text-white bg-blue-600 rounded-lg"
        onClick={() => setShowLyrics(!showLyrics)}
      >
        {showLyrics ? "Songs" : "Lyrics"}
      </Button>

      {/* ✅ Movable Progress Bar */}
      <div
        className="relative w-full bg-gray-200 h-2 rounded-lg mt-2 flex items-center cursor-pointer"
        onMouseDown={() => setIsSeeking(true)}
        onMouseUp={(event) => {
          setIsSeeking(false);
          handleProgressBarClick(event);
        }}
        onMouseMove={handleProgressBarDrag}
      >
        <div
          className="absolute bg-blue-500 h-2 rounded-lg"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>

      {/* ✅ Time Display */}
      <p className="mt-2 text-sm text-center text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
