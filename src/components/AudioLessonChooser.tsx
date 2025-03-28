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

export default function AudioLessonChooser({
  lessons,
  selectedLesson,
  onSelectLesson,
}: {
  lessons: AudioLesson[];
  selectedLesson: AudioLesson | null;
  onSelectLesson: (lesson: AudioLesson) => void;
}) {
  const categorized = lessons.reduce<Record<string, AudioLesson[]>>((acc, lesson) => {
    const lang = lesson.language || "Unknown";
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(lesson);
    return acc;
  }, {});

  return (
    <div className="flex w-full flex-col gap-6 overflow-visible p-4">
      {Object.entries(categorized).map(([lang, lessons]) => (
        <div key={lang} className="w-full">
          <h2 className="text-lg font-bold mb-2">{lang}</h2>
          <div className="flex gap-4 overflow-x-auto">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex flex-col items-center p-3 rounded-lg cursor-pointer text-white ${
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
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
                <h3 className="mt-2 text-center font-semibold text-md">
                  {lesson.title}
                </h3>
                <p className="text-center text-sm text-gray-200">{lesson.speaker}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
