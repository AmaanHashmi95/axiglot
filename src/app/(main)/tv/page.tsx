"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import VideoChooser from "@/components/VideoChooser";
import VideoPlayer from "@/components/VideoPlayer";
import Subtitles from "@/components/Subtitles";
import VideoScreen from "@/components/VideoScreen";
import { Video } from "@/lib/video";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubtitles, setShowSubtitles] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const API_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";

  useEffect(() => {
    async function fetchVideos() {
      try {
        console.log("Fetching from API:", `${API_URL}/api/video`);
        const res = await fetch(`${API_URL}/api/video`);
        if (!res.ok)
          throw new Error(`Failed to fetch videos. Status: ${res.status}`);
        const fetchedVideos: Video[] = await res.json();
        if (fetchedVideos.length === 0)
          throw new Error("No videos available in the database.");

        setVideos(fetchedVideos);
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [API_URL]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowSubtitles(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleBackToChooser = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setSelectedVideo(null);
    setShowSubtitles(false);
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="relative flex w-full flex-col gap-4 overflow-hidden p-4">
      {selectedVideo ? (
        <>
          <VideoScreen
            videoUrl={selectedVideo.videoUrl}
            showSubtitles={showSubtitles}
            videoRef={videoRef}
          />
          <Subtitles video={selectedVideo} currentTime={currentTime} />

          {/* VideoPlayer should only be visible when video screen is active */}
          <VideoPlayer
            video={selectedVideo}
            onTimeUpdate={setCurrentTime}
            showSubtitles={showSubtitles}
            setShowSubtitles={setShowSubtitles}
            videoRef={videoRef}
            onBack={handleBackToChooser}
          />
        </>
      ) : (
        <VideoChooser
          videos={videos}
          selectedVideo={selectedVideo}
          onSelectVideo={handleSelectVideo}
        />
      )}
    </div>
  );
}
