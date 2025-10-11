import { useRef, useState, useEffect } from "react";
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
  Swahili: "/flags/kenya-flag.png",
  Farsi: "/flags/iran-flag.webp",
  Portuguese: "/flags/brazil-flag.png",
  Russian: "/flags/russia-flag.png",
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

  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const scrollLeftBy = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
    updateScrollButtons();
  };

  const scrollRightBy = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
    updateScrollButtons();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    dragStartScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = dragStartScrollLeft.current - walk;
  };

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(
      scrollRef.current.scrollLeft <
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth
    );
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [songs.length]);

  const getBackgroundStyle = (language: string | undefined) => {
    switch (language) {
      case "Punjabi":
        return "linear-gradient(135deg, #00bf63, #ff8a00)";
      case "Urdu":
        return "linear-gradient(135deg, #00650b, #adadad)";
      default:
        return "linear-gradient(135deg, #cccccc, #999999)";
    }
  };

  return (
    <div className="relative flex w-full items-center">
      {canScrollLeft && (
        <button
          onClick={scrollLeftBy}
          className="z-51 absolute left-[-40px] top-1/2 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ◀
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="no-scrollbar flex w-full cursor-grab gap-4 overflow-x-auto p-2 active:cursor-grabbing"
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
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
            style={{ background: getBackgroundStyle(song.language) }}
          >
            <div className="flex h-32 w-full items-center justify-center">
              <Image
                src={song.imageUrl || "/icons/Music.png"}
                alt={song.title}
                width={120}
                height={120}
                className="select-none[user-select:none] h-full w-full rounded-lg object-cover [-webkit-touch-callout:none] [-webkit-user-select:none]"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            {/* Transparent overlay to catch long-press/right-click/drag */}
            <div
              aria-hidden
              className="absolute inset-0 z-10"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <h3 className="text-md mt-2 text-center font-semibold">
              {song.title}
            </h3>
            <p className="text-center text-sm text-gray-200">{song.artist}</p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRightBy}
          className="z-49 absolute right-[-40px] top-1/2 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}
