import { useRef, useState } from "react";
import { Song } from "@/lib/song";
import Image from "next/image";

interface SongChooserProps {
  songs: Song[];
  selectedSong: Song | null;
  onSelectSong: (song: Song) => void;
}

// Mapping languages to flags
const languageFlags: Record<string, string> = {
  Punjabi: "/flags/india-flag.png",
  Urdu: "/flags/pakistan-flag.png",
};

export default function SongChooser({ songs, selectedSong, onSelectSong }: SongChooserProps) {
  // Group songs by language
  const categorizedSongs = songs.reduce<Record<string, Song[]>>((acc, song) => {
    const language = song.language || "Unknown";
    if (!acc[language]) acc[language] = [];
    acc[language].push(song);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 w-full max-w-none p-4 overflow-visible">
      {Object.entries(categorizedSongs).map(([language, songs]) => (
        <div key={language} className="w-full">
          {/* Language Heading with Flag */}
          <div className="flex items-center gap-2 mb-2">
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

          {/* Song Carousel with Navigation */}
          <SongCarousel songs={songs} selectedSong={selectedSong} onSelectSong={onSelectSong} />
        </div>
      ))}
    </div>
  );
}

// ✅ Reusable Carousel Component
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

  // Scroll left
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
      updateScrollButtons();
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
      updateScrollButtons();
    }
  };

  // Update arrow visibility based on scroll position
  const updateScrollButtons = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      );
    }
  };

  return (
    <div className="relative w-full flex items-center">
      {/* Left Arrow - Positioned Fully Outside */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md z-20"
        >
          ◀
        </button>
      )}

      {/* Scrollable Song List */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 p-2 no-scrollbar w-full"
        onScroll={updateScrollButtons}
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none", // Hide scrollbar (Firefox)
          WebkitOverflowScrolling: "touch",
        }}
      >
        {songs.map((song) => (
          <div
            key={song.id}
            className={`cursor-pointer p-3 border rounded-lg min-w-[150px] transition ${
              selectedSong?.id === song.id ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => onSelectSong(song)}
          >
            <h3 className="text-md font-semibold">{song.title}</h3>
            <p className="text-sm">{song.artist}</p>
          </div>
        ))}
      </div>

      {/* Right Arrow - Positioned Fully Outside */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md z-20"
        >
          ▶
        </button>
      )}
    </div>
  );
}


<style jsx>{`
  .no-scrollbar {
    -ms-overflow-style: none;  /* Hide scrollbar on IE/Edge */
    scrollbar-width: none; /* Hide scrollbar on Firefox */
  }

  .no-scrollbar::-webkit-scrollbar {
    width: 0px;
    height: 0px; /* Hide scrollbar on WebKit browsers (Chrome, Safari) */
  }

  /* ✅ Safari-specific fix: Uses overflow hidden with masking to prevent scrollbar flickering */
  @supports (-webkit-touch-callout: none) {
    .no-scrollbar {
      mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
    }
  }
`}</style>