"use client";

import { useEffect } from "react";

interface VideoScreenProps {
  videoUrl: string;
  showSubtitles: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function VideoScreen({ videoUrl, showSubtitles, videoRef }: VideoScreenProps) {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  if (!showSubtitles) return null; // Only show when subtitles are enabled

  return (
    <div className="flex justify-center w-full max-w-3xl mx-auto mt-4">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-lg shadow-lg"
        playsInline
        controls={false} // Prevents default controls
      />
    </div>
  );
}
