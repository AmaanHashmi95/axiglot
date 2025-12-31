"use client";

interface VideoScreenProps {
  videoUrl: string;
  showSubtitles: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function VideoScreen({ videoUrl, showSubtitles, videoRef }: VideoScreenProps) {
  if (!showSubtitles) return null;

  return (
    <div className="flex w-full justify-center px-2 mx-auto mt-4">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full max-w-3xl max-h-[45vh] sm:max-h-[60vh] rounded-lg shadow-lg object-contain
                 select-none [-webkit-user-select:none] [-webkit-touch-callout:none]"
        playsInline
        webkit-playsinline="true"
        controls={false}
        // ✅ helps initial buffering & scrubbing (UI unchanged)
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}