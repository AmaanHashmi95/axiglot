"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoChooser from "@/app/(main)/tv/VideoChooser";
import VideoPlayer from "@/app/(main)/tv/VideoPlayer";
import Subtitles from "@/app/(main)/tv/Subtitles";
import VideoScreen from "@/app/(main)/tv/VideoScreen";
import { Video } from "@/lib/video";
import BrowserWarning from "@/app/(main)/components/BrowserWarning";
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

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/video"); // relative path
        if (!res.ok) throw new Error(`Failed to fetch videos. Status: ${res.status}`);
        const fetchedVideos: Video[] = await res.json();
        if (fetchedVideos.length === 0) throw new Error("No videos available in the database.");

        setVideos(fetchedVideos);

        if (videoId) {
          const autoSelectedVideo = fetchedVideos.find((v) => v.id === videoId);
          if (autoSelectedVideo) {
            setSelectedVideo(autoSelectedVideo);
            setShowSubtitles(true);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Fetch error:", message);
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
          <div
            className="flex flex-col overflow-y-auto"
            style={{ height: "calc(100vh - 120px)" }}
          >
            <VideoScreen
              videoUrl={selectedVideo.videoUrl}
              showSubtitles={showSubtitles}
              videoRef={videoRef}
            />
            <div className="mt-2 px-2">
              <Subtitles video={selectedVideo} currentTime={currentTime} />
            </div>
          </div>

          <VideoPlayer
            video={selectedVideo}
            onTimeUpdate={handleTimeUpdate}
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
      <>More videos will be uploaded very shortly - watch this space</>
    </div>
  );
}
