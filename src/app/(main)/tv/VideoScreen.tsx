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
    <div className="flex w-full justify-center px-2 mx-auto mt-4">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full max-w-3xl max-h-[45vh] sm:max-h-[60vh] rounded-lg shadow-lg object-contain
                   select-none [-webkit-user-select:none] [-webkit-touch-callout:none]"
        // Keep inline on iOS, avoid fullscreen / PiP UIs
        playsInline
        webkit-playsinline="true"
        // No native controls => no seek/speed/download UI
        controls={false}
        // Draw first frame without auto-playing
        preload="metadata"
        // Disable native download-ish surfaces
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        // Deter common save paths
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}
