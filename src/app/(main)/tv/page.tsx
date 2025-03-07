"use client";

import { useEffect, useState, useCallback } from "react";
import VideoChooser from "@/components/VideoChooser";
import VideoPlayer from "@/components/VideoPlayer";
import Subtitles from "@/components/Subtitles";
import { Video } from "@/lib/video";

export default function Page() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubtitles, setShowSubtitles] = useState(false);

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
        setSelectedVideo(fetchedVideos[0]); // ✅ Default to first video
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

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-4 p-4 w-full overflow-hidden">
      {showSubtitles ? (
        selectedVideo && <Subtitles video={selectedVideo} currentTime={currentTime} />
      ) : (
        <VideoChooser
          videos={videos}
          selectedVideo={selectedVideo}
          onSelectVideo={setSelectedVideo}
        />
      )}

      {/* Add padding to ensure space for VideoPlayer */}
     <div className="pb-24"></div>

      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onTimeUpdate={setCurrentTime}
          showSubtitles={showSubtitles}
          setShowSubtitles={setShowSubtitles}
        />
      )}
    </div>
  );
}