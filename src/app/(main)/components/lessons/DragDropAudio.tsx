"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface DragDropAudioProps {
  audioUrl: string;
  words: string[];
  correctOrder: string[];
  onSubmit: (isCorrect: boolean) => void;
  /** Force RTL behavior if known; if omitted, auto-detect from glyphs */
  isRTL?: boolean;
}

export default function DragDropAudio({
  audioUrl,
  words,
  correctOrder,
  onSubmit,
  isRTL,
}: DragDropAudioProps) {
  const [userOrder, setUserOrder] = useState<(string | null)[]>(
    Array(correctOrder.length).fill(null)
  );
  const [availableWords, setAvailableWords] = useState<string[]>(words);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordWidthsRef = useRef<Record<string, number>>({});

  // Why: auto-enable RTL even if prop not passed
  const autoIsRTL = useMemo(() => {
    const sample = [...words, ...correctOrder].join(" ");
    // Arabic, Persian, Urdu, Hebrew ranges
    return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(sample);
  }, [words, correctOrder]);

  const rtl = typeof isRTL === 'boolean' ? isRTL : autoIsRTL;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error('Audio playback failed:', err));
    }
  }, []);

  // Why: robust deep equality & NFC normalization; avoids hidden form diffs
  const normalizeToken = useCallback((s: string | null) =>
     (s ?? '').replace(/[\u00A0\u202F]/g, ' ').trim().normalize('NFC'), []);
const arraysEqual = useCallback((a: (string | null)[], b: string[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (normalizeToken(a[i]) !== normalizeToken(b[i])) return false;
    }
    return true;
  }, [normalizeToken]);

  useEffect(() => {
    if (!userOrder.includes(null)) {
      const isCorrect = arraysEqual(userOrder, correctOrder);
      setIsCorrectAnswer(isCorrect);
      onSubmit(isCorrect);
    }
  }, [userOrder, correctOrder, arraysEqual, onSubmit]);

  const handleSelectWord = (word: string, idxInBank: number) => {
    const emptyIndex = userOrder.indexOf(null); // RTL fills from right because index 0 is rightmost in dir=rtl
    if (emptyIndex !== -1) {
      const newOrder = [...userOrder];
      newOrder[emptyIndex] = word;
      setUserOrder(newOrder);

      // remove by index from the current bank (supports duplicates)
      setAvailableWords((prev) => {
        const next = [...prev];
        next.splice(idxInBank, 1);
        return next;
      });
    }
  };

  const handleRemoveWord = (index: number) => {
    const wordToRemove = userOrder[index];
    if (wordToRemove !== null) {
      const newOrder = [...userOrder];
      newOrder[index] = null;
      setUserOrder(newOrder);
      setAvailableWords((prev) => [...prev, wordToRemove]);
      setIsCorrectAnswer(null);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <audio ref={audioRef} src={audioUrl} autoPlay />

      {/* Drop Zones */}
      <div
        className="flex flex-wrap justify-center gap-2 mt-6"
        // Why: make visual order match logical index order for RTL
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {userOrder.map((word, index) => {
          let bgClass = word
            ? 'bg-gray-600'
            : 'border-dashed border-gray-400 text-gray-400';

          if (word && isCorrectAnswer !== null) {
            bgClass = isCorrectAnswer
              ? 'bg-gradient-to-r from-[#00E2FF] to-[#00C2FF] text-white'
              : 'bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white';
          }

          const wordWidth = word ? wordWidthsRef.current[word] : 80;

          return (
            <div
              key={index}
              onClick={() => handleRemoveWord(index)}
              className={`h-12 px-3 border-2 flex items-center justify-center cursor-pointer text-center rounded-lg ${bgClass}`}
              style={{ width: `${wordWidth || 80}px` }}
            >
              {word || ''}
            </div>
          );
        })}
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap justify-center gap-3 mt-8" dir={rtl ? 'rtl' : 'ltr'}>
        {availableWords.map((word, index) => (
          <div
            key={`${word}-${index}`}
            onClick={() => handleSelectWord(word, index)}
            ref={(el) => {
              if (el) wordWidthsRef.current[word] = el.offsetWidth;
            }}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg shadow text-lg cursor-pointer transition inline-block"
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
