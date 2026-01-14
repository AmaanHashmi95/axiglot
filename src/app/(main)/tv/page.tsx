"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoChooser from "@/app/(main)/tv/VideoChooser";
import VideoPlayer from "@/app/(main)/tv/VideoPlayer";
import Subtitles from "@/app/(main)/tv/Subtitles";
import VideoScreen from "@/app/(main)/tv/VideoScreen";
import type { Video, VideoListItem, VideoSubtitles } from "@/lib/video";
import BrowserWarning from "@/app/(main)/components/BrowserWarning";
import { Loader2 } from "lucide-react";

function emptySubtitles(): VideoSubtitles {
  return { englishSentences: [], targetSentences: [], transliterationSentences: [] };
}

export default function Page() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");

  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubtitles, setShowSubtitles] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const subtitlesCache = useRef<Map<string, VideoSubtitles>>(new Map());

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const fetchSubtitles = useCallback(async (id: string): Promise<VideoSubtitles> => {
    const cached = subtitlesCache.current.get(id);
    if (cached) return cached;

    const res = await fetch(`/api/video/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch subtitles. Status: ${res.status}`);
    const data = (await res.json()) as VideoSubtitles;

    subtitlesCache.current.set(id, data);
    return data;
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/video");
        if (!res.ok) throw new Error(`Failed to fetch videos. Status: ${res.status}`);
        const fetched = (await res.json()) as VideoListItem[];
        if (fetched.length === 0) throw new Error("No videos available in the database.");

        setVideos(fetched);

        if (videoId) {
          const auto = fetched.find((v) => v.id === videoId);
          if (auto) {
            // select immediately (video can start), subtitles load in background
            setSelectedVideo({ ...auto, ...emptySubtitles() });
            setShowSubtitles(true);

            fetchSubtitles(auto.id)
              .then((subs) => setSelectedVideo({ ...auto, ...subs }))
              .catch((e: unknown) => console.error("Subtitle fetch error:", e));
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
  }, [videoId, fetchSubtitles]);

  const handleSelectVideo = useCallback(
    (video: VideoListItem) => {
      setSelectedVideo({ ...video, ...emptySubtitles() });
      setShowSubtitles(true);
      setCurrentTime(0);

      // start subtitle load without blocking playback
      fetchSubtitles(video.id)
        .then((subs) => setSelectedVideo({ ...video, ...subs }))
        .catch((e: unknown) => console.error("Subtitle fetch error:", e));
    },
    [fetchSubtitles]
  );

  const handleBackToChooser = useCallback(() => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      // Keep the element; avoid .load() thrash
    }
    setSelectedVideo(null);
    setShowSubtitles(false);
    setCurrentTime(0);
  }, []);

  if (loading) return <Loader2 className="mx-auto my-3 animate-spin" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="relative flex w-full flex-col gap-4 overflow-hidden p-4">
      <BrowserWarning />
      {selectedVideo ? (
        <>
          <div className="flex flex-col overflow-y-auto" style={{ height: "calc(100vh - 120px)" }}>
            <VideoScreen
              videoUrl={selectedVideo.streamSrc}
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
        <VideoChooser videos={videos as any} selectedVideo={null} onSelectVideo={handleSelectVideo as any} />
      )}
    </div>
  );
}