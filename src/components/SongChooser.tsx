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

export default function SongChooser({ songs, selectedSong, onSelectSong }: SongChooserProps) {
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

          <SongCarousel songs={songs} selectedSong={selectedSong} onSelectSong={onSelectSong} />
        </div>
      ))}
    </div>
  );
}

function SongCarousel({ songs, selectedSong, onSelectSong }: { songs: Song[]; selectedSong: Song | null; onSelectSong: (song: Song) => void; }) {
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
      setCanScrollRight(scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
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
    <div className="relative w-full flex items-center">
      {canScrollLeft && (
        <button onClick={scrollLeft} className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md z-20">
          ◀
        </button>
      )}

      <div ref={scrollRef} className="flex overflow-x-auto gap-4 p-2 no-scrollbar w-full"
        onScroll={updateScrollButtons}
        style={{ overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {songs.map((song) => (
          <div 
            key={song.id} 
            className={`cursor-pointer p-3 border rounded-lg min-w-[150px] aspect-[4/5] flex flex-col items-center transition text-white`} 
            onClick={() => onSelectSong(song)}
            style={{ background: getBackgroundStyle(song.language) }} // ✅ Apply background gradient
          >
            {/* ✅ Square Image */}
            <div className="w-full h-32 flex justify-center items-center">
              <Image
                src={song.imageUrl || "/icons/Music.png"}
                alt={song.title}
                width={120}
                height={120}
                className="object-cover rounded-lg w-full h-full"
              />
            </div>

            {/* ✅ Title and Artist */}
            <h3 className="text-md font-semibold mt-2 text-center">{song.title}</h3>
            <p className="text-sm text-gray-200 text-center">{song.artist}</p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button onClick={scrollRight} className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md z-20">
          ▶
        </button>
      )}
    </div>
  );
}

