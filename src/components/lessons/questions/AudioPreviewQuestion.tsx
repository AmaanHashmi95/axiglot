"use client";

import React, { useRef } from "react";

interface AudioPreviewQuestionProps {
  options: string[];
  audioUrl?: string | null;
  playAudio: (url?: string | null) => void;
}

export default function AudioPreviewQuestion({
  options,
  audioUrl,
  playAudio,
}: AudioPreviewQuestionProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-4">
          <button
            onClick={() => playAudio(audioUrl)}
            className="btn btn-primary"
          >
            {option}
          </button>
        </div>
      ))}
      <audio ref={audioRef} />
    </div>
  );
}
