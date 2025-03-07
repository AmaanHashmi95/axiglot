import { useRef, useState } from "react";
import { Video } from "@/lib/video";
import Image from "next/image";

interface VideoChooserProps {
  videos: Video[];
  selectedVideo: Video | null;
  onSelectVideo: (video: Video) => void;
}

const languageFlags: Record<string, string> = {
  Punjabi: "/flags/india-flag.png",
  Urdu: "/flags/pakistan-flag.png",
};

export default function VideoChooser({
  videos,
  selectedVideo,
  onSelectVideo,
}: VideoChooserProps) {
  const categorizedVideos = videos.reduce<Record<string, Video[]>>((acc, video) => {
    const language = video.language || "Unknown";
    if (!acc[language]) acc[language] = [];
    acc[language].push(video);
    return acc;
  }, {});

  return (
    <div className="flex w-full max-w-none flex-col gap-6 overflow-visible p-4">
      {Object.entries(categorizedVideos).map(([language, videos]) => (
        <div key={language} className="w-full">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-bold">{language}</h2>
            {languageFlags[language] && (
              <Image
                src={languageFlags[language]}
                alt={`${language} Flag`}
                width={30}
                height={20}
                className="rounded-sm"
              />
            )}
          </div>

          <VideoCarousel
            videos={videos}
            selectedVideo={selectedVideo}
            onSelectVideo={onSelectVideo}
          />
        </div>
      ))}
    </div>
  );
}

function VideoCarousel({
  videos,
  selectedVideo,
  onSelectVideo,
}: {
  videos: Video[];
  selectedVideo: Video | null;
  onSelectVideo: (video: Video) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(videos.length > 3);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
      updateScrollButtons();
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
      updateScrollButtons();
    }
  };

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft <
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth,
      );
    }
  };

  // ✅ Define background gradients for each language
  const getBackgroundStyle = (language: string | undefined) => {
    switch (language) {
      case "Punjabi":
        return "linear-gradient(135deg, #00bf63, #ff8a00)";
      case "Urdu":
        return "linear-gradient(135deg, #00650b, #adadad)";
      default:
        return "linear-gradient(135deg, #cccccc, #999999)"; // Default gray for unknown languages
    }
  };

  return (
    <div className="relative flex w-full items-center">
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-[-40px] top-1/2 z-51 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ◀
        </button>
      )}

      <div
        ref={scrollRef}
        className="no-scrollbar flex w-full gap-4 overflow-x-auto p-2"
        onScroll={updateScrollButtons}
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className={`flex aspect-[5/4] min-w-[150px] cursor-pointer flex-col items-center rounded-lg border p-3 text-white transition ${
              selectedVideo?.id === video.id
                ? "border-4 border-[#00E2FF]"
                : "border-transparent"
            }`}
            onClick={() => onSelectVideo(video)}
            style={{ background: getBackgroundStyle(video.language) }} // ✅ Apply background gradient
          >
            {/* ✅ Square Image */}
            <div className="flex h-32 w-full items-center justify-center">
              <Image
                src={video.imageUrl || "/icons/Video.png"}
                alt={video.title}
                width={130}
                height={120}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>

            {/* ✅ Title and Genre */}
            <h3 className="text-md mt-2 text-center font-semibold">
              {video.title}
            </h3>
            <p className="text-center text-sm text-gray-200">{video.genre}</p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-[-40px] top-1/2 z-49 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}
