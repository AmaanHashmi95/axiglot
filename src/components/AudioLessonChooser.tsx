import { useRef, useState } from "react";
import Image from "next/image";

interface AudioLesson {
  id: string;
  title: string;
  speaker: string;
  audioUrl: string;
  language?: string;
  imageUrl?: string;
}

const languageFlags: Record<string, string> = {
  Punjabi: "/flags/india-flag.png",
  Urdu: "/flags/pakistan-flag.png",
};

export default function AudioLessonChooser({
  lessons,
  selectedLesson,
  onSelectLesson,
}: {
  lessons: AudioLesson[];
  selectedLesson: AudioLesson | null;
  onSelectLesson: (lesson: AudioLesson) => void;
}) {
  const categorized = lessons.reduce<Record<string, AudioLesson[]>>(
    (acc, lesson) => {
      const lang = lesson.language || "Unknown";
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push(lesson);
      return acc;
    },
    {},
  );

  return (
    <div className="flex w-full flex-col gap-6 overflow-visible p-4">
      {Object.entries(categorized).map(([lang, lessons]) => (
        <div key={lang} className="relative w-full">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-bold">{lang}</h2>
            {languageFlags[lang] && (
              <Image
                src={languageFlags[lang]}
                alt={`${lang} Flag`}
                width={30}
                height={20}
                className="rounded-sm"
              />
            )}
          </div>
          <AudioLessonCarousel
            lessons={lessons}
            selectedLesson={selectedLesson}
            onSelectLesson={onSelectLesson}
          />
        </div>
      ))}
    </div>
  );
}

function AudioLessonCarousel({
  lessons,
  selectedLesson,
  onSelectLesson,
}: {
  lessons: AudioLesson[];
  selectedLesson: AudioLesson | null;
  onSelectLesson: (lesson: AudioLesson) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(lessons.length > 3);

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

  return (
    <div className="relative flex w-full items-center">
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-[-40px] top-1/2 z-10 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ◀
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="no-scrollbar flex w-full gap-4 overflow-x-auto p-2"
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`flex cursor-pointer flex-col items-center rounded-lg p-3 text-white ${
              selectedLesson?.id === lesson.id
                ? "border-4 border-[#00E2FF]"
                : "border border-transparent"
            }`}
            onClick={() => onSelectLesson(lesson)}
            style={{
              background: "linear-gradient(135deg, #5f72be, #9b23ea)",
              minWidth: "150px",
            }}
          >
            <div className="h-32 w-32">
              <Image
                src={lesson.imageUrl || "/icons/Music.png"}
                alt={lesson.title}
                width={120}
                height={120}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
            <h3 className="text-md mt-2 text-center font-semibold">
              {lesson.title}
            </h3>
            <p className="text-center text-sm text-gray-200">
              {lesson.speaker}
            </p>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-[-40px] top-1/2 z-10 -translate-y-1/2 transform rounded-full p-3 shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}
