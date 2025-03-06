import { useRef, useState } from "react";
import { Song } from "@/lib/song";
import Image from "next/image";

interface SongChooserProps {
  songs: Song[];
  selectedSong: Song | null;
  onSelectSong: (song: Song) => void;
}

const languageFlags: Record<string, string> = {
  Punjabi: "/flags/india-flag.png",
  Urdu: "/flags/pakistan-flag.png",
};

export default function SongChooser({
  songs,
  selectedSong,
  onSelectSong,
}: SongChooserProps) {
  const categorizedSongs = songs.reduce<Record<string, Song[]>>((acc, song) => {
    const language = song.language || "Unknown";
    if (!acc[language]) acc[language] = [];
    acc[language].push(song);
    return acc;
  }, {});

  return (
    <div className="flex w-full max-w-none flex-col gap-6 overflow-visible p-4">
      {Object.entries(categorizedSongs).map(([language, songs]) => (
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

          <SongCarousel
            songs={songs}
            selectedSong={selectedSong}
            onSelectSong={onSelectSong}
          />
        </div>
      ))}
    </div>
  );
}

function SongCarousel({
  songs,
  selectedSong,
  onSelectSong,
}: {
  songs: Song[];
  selectedSong: Song | null;
  onSelectSong: (song: Song) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(songs.length > 3);

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
          className="absolute left-[-40px] top-1/2 z-20 -translate-y-1/2 transform rounded-full p-3 shadow-md"
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
        {songs.map((song) => (
          <div
            key={song.id}
            className={`flex aspect-[4/5] min-w-[150px] cursor-pointer flex-col items-center rounded-lg border p-3 text-white transition ${
              selectedSong?.id === song.id
                ? "border-4 border-[#00E2FF]"
                : "border-transparent"
            }`}
            onClick={() => onSelectSong(song)}
            style={{ background: getBackgroundStyle(song.language) }} // ✅ Apply background gradient
          >
            {/* ✅ Square Image */}
            <div className="flex h-32 w-full items-center justify-center">
              <Image
                src={song.imageUrl || "/icons/Music.png"}
                alt={song.title}
                width={120}
                height={120}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>

            {/* ✅ Title and Artist */}
            <h3 className="text-md mt-2 text-center font-semibold">
              {song.title}
            </h3>
            <p className="text-center text-sm text-gray-200">{song.artist}</p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-[-40px] top-1/2 z-20 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}
