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
  const moved = useRef(false);
  const startX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const DRAG_THRESHOLD = 8; // px – if user moves more than this, it's a drag, not a click

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
    moved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    dragStartScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    // don't reset moved here; card onClick checks it
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > DRAG_THRESHOLD) moved.current = true;
    scrollRef.current.scrollLeft = dragStartScrollLeft.current - walk;
  };

  // Touch support (iOS)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    moved.current = false;
    startX.current = e.touches[0].clientX - scrollRef.current.offsetLeft;
    dragStartScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const clientX = e.touches[0].clientX;
    const walk = clientX - startX.current;
    if (Math.abs(walk) > DRAG_THRESHOLD) moved.current = true;
    scrollRef.current.scrollLeft = dragStartScrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(
      scrollRef.current.scrollLeft <
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth,
    );
  };

  useEffect(() => {
    updateScrollButtons();
    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
          className="absolute left-[-40px] top-1/2 z-10 -translate-y-1/2 transform rounded-full p-3 shadow-md"
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="no-scrollbar flex w-full gap-4 overflow-x-auto p-2"
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x", // ← iOS can pan horizontally with touch
          cursor: "grab",       // open hand between cards
        }}
      >
        {songs.map((song) => (
          <div
            key={song.id}
            role="button"
            tabIndex={0}
            className={`relative flex cursor-pointer flex-col items-center rounded-lg p-3 text-white ${
              selectedSong?.id === song.id
                ? "border-4 border-[#00E2FF]"
                : "border border-transparent"
            }`}
            onClick={() => {
              // If the user dragged, suppress the click
              if (moved.current) return;
              onSelectSong(song);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectSong(song);
              }
            }}
            style={{
              background: getBackgroundStyle(song.language),
              minWidth: "150px",
            }}
          >
            <div className="relative h-32 w-32 select-none">
              <Image
                src={song.imageUrl || "/icons/Music.png"}
                alt={song.title}
                width={120}
                height={120}
                className="pointer-events-none h-full w-full rounded-lg object-cover select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            {/* Make the overlay NON-interactive so it doesn't steal touches/clicks */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10" />

            <h3 className="text-md mt-2 text-center font-semibold">{song.title}</h3>
            <p className="text-center text-sm text-gray-200">{song.artist}</p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRightBy}
          className="absolute right-[-40px] top-1/2 z-10 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}
