// src/components/ReadingChooser.tsx
import { useRef, useState, useEffect } from "react";
import { Book } from "@/lib/book";
import Image from "next/image";

interface ReadingChooserProps {
  books: Book[];
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
}

const languageFlags: Record<string, string> = {
  Punjabi: "/flags/india-flag.png",
  Urdu: "/flags/pakistan-flag.png",
  Swahili: "/flags/kenya-flag.png",
  Farsi: "/flags/iran-flag.webp",
  Portuguese: "/flags/brazil-flag.png",
  Russian: "/flags/russia-flag.png",
};

export default function ReadingChooser({
  books,
  selectedBook,
  onSelectBook,
}: ReadingChooserProps) {
  const categorizedBooks = books.reduce<Record<string, Book[]>>((acc, book) => {
    const language = book.language || "Unknown";
    if (!acc[language]) acc[language] = [];
    acc[language].push(book);
    return acc;
  }, {});

  return (
    <div className="flex w-full max-w-none flex-col gap-6 overflow-visible p-4">
      {Object.entries(categorizedBooks).map(([language, books]) => (
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

          <BookCarousel
            books={books}
            selectedBook={selectedBook}
            onSelectBook={onSelectBook}
          />
        </div>
      ))}
    </div>
  );
}

function BookCarousel({
  books,
  selectedBook,
  onSelectBook,
}: {
  books: Book[];
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(books.length > 3);

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
  }, [books.length]);

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
          className="absolute left-[-40px] top-1/2 z-51 -translate-y-1/2 transform rounded-full p-3 shadow-md"
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
        {books.map((book) => (
          <div
            key={book.id}
            className={`flex aspect-[5/4] min-w-[150px] cursor-pointer flex-col items-center rounded-lg border p-3 text-white transition ${
              selectedBook?.id === book.id
                ? "border-4 border-[#00E2FF]"
                : "border-transparent"
            }`}
            onClick={() => onSelectBook(book)}
            style={{ background: getBackgroundStyle(book.language) }}
          >
            <div className="flex h-32 w-full items-center justify-center">
              <Image
                src={book.imageUrl || "/icons/Book.png"}
                alt={book.title}
                width={130}
                height={120}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
            <h3 className="text-md mt-2 text-center font-semibold">
              {book.title}
            </h3>
            <p className="text-center text-sm text-gray-200">{book.genre}</p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRightBy}
          className="absolute right-[-40px] top-1/2 z-49 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}
