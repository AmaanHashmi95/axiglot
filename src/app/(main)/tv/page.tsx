"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoChooser from "@/components/VideoChooser";
import VideoPlayer from "@/components/VideoPlayer";
import Subtitles from "@/components/Subtitles";
import VideoScreen from "@/components/VideoScreen";
import { Video } from "@/lib/video";
import { Button } from "@/components/ui/button";
import BrowserWarning from "@/components/BrowserWarning";
import { Loader2 } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
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

        // Auto-select video if videoId exists in URL
        if (videoId) {
          const autoSelectedVideo = fetchedVideos.find((v) => v.id === videoId);
          if (autoSelectedVideo) {
            setSelectedVideo(autoSelectedVideo);
            setShowSubtitles(true);
          }
        }

      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [videoId]);

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

  if (loading) return <Loader2 className="mx-auto my-3 animate-spin" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="relative flex h-screen w-full flex-col gap-4 overflow-hidden p-4">
      <BrowserWarning />
      {selectedVideo ? (
        <>
        <div className="flex flex-col overflow-y-auto" style={{ height: "calc(100vh - 120px)"}}>
          <VideoScreen
            videoUrl={selectedVideo.videoUrl}
            showSubtitles={showSubtitles}
            videoRef={videoRef}
          />
          <div className="mt-2 px-2">
          <Subtitles video={selectedVideo} currentTime={currentTime} />
          </div>
          </div>


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
