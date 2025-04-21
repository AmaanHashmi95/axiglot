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
    <div className="flex justify-center w-full mx-auto mt-4 px-2">
  <video
    ref={videoRef}
    src={videoUrl}
    className="w-full max-w-3xl max-h-[45vh] sm:max-h-[60vh] rounded-lg shadow-lg object-contain"
    playsInline
    controls={false}
  />
</div>

  );
}
