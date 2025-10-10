"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AudioLessonChooser from "@/app/(main)/audio-lessons/AudioLessonChooser";
import AudioLessonPlayer from "@/app/(main)/audio-lessons/AudioLessonPlayer";
import { Loader2 } from "lucide-react";
import BrowserWarning from "@/app/(main)/components/BrowserWarning";

interface AudioLesson {
  id: string;
  title: string;
  speaker: string;
  audioUrl: string;
  language?: string;
  imageUrl?: string;
}

export default function Page() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  const [lessons, setLessons] = useState<AudioLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<AudioLesson | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch("/api/audio-lessons"); // ← relative path
        if (!res.ok) throw new Error("Failed to fetch audio lessons.");
        const data: AudioLesson[] = await res.json();
        setLessons(data);

        if (lessonId) {
          const found = data.find((l) => l.id === lessonId);
          if (found) setSelectedLesson(found);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, [lessonId]);

  if (loading) return <Loader2 className="mx-auto my-3 animate-spin" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden p-4">
      <BrowserWarning />
      <AudioLessonChooser
        lessons={lessons}
        selectedLesson={selectedLesson}
        onSelectLesson={setSelectedLesson}
      />
      <div className="pb-24"></div>
      {selectedLesson && (
        <AudioLessonPlayer lesson={selectedLesson} onTimeUpdate={setCurrentTime} />
      )}
    </div>
  );
}
