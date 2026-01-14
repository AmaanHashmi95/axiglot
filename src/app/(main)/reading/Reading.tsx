// src/app/(main)/reading/Reading.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Book, BookWord } from "@/lib/book";
import ReadingBookmarkButton from "./ReadingBookmarkButton";

interface ReadingProps {
  book: Book;
  initialPage?: number;
  onBack: () => void;
}

type PopupPosition = { top: number; left: number };

const GAP_PX = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function almostEqual(a: number, b: number, eps = 0.5) {
  return Math.abs(a - b) <= eps;
}

export default function Reading({ book, initialPage = 0, onBack }: ReadingProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [hoveredSentenceIndex, setHoveredSentenceIndex] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  const sentenceRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const popupEl = popupRef.current;
      const clickedEl = event.target as Node;

      if (
        popupEl &&
        !popupEl.contains(clickedEl) &&
        !Object.values(sentenceRefs.current).some((ref) => ref?.contains(clickedEl))
      ) {
        setSelectedSentenceIndex(null);
        setPopupPosition(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bookPages = book.bookPages || [];
  const totalPages = bookPages.length;
  const pageData = bookPages[currentPage] || { bookSentences: [] };

  const isPunctuation = (text: string) => /^[.,!?;:"'()\-\u2014]+$/.test(text);
  const isSentenceEndingPunctuation = (text: string) => /[.!?]+$/.test(text);

  const computeAndSetPopupPosition = (index: number) => {
    const sentenceEl = sentenceRefs.current[index];
    const containerEl = containerRef.current;
    const popupEl = popupRef.current;

    if (!sentenceEl || !containerEl || !popupEl) return;

    const sentenceRect = sentenceEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const popupRect = popupEl.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const popupWidth = popupRect.width;
    const popupHeight = popupRect.height;

    const sentenceLeftRel = sentenceRect.left - containerRect.left;
    const sentenceTopRel = sentenceRect.top - containerRect.top;
    const sentenceBottomRel = sentenceRect.bottom - containerRect.top;

    const left = clamp(sentenceLeftRel, 0, Math.max(0, containerWidth - popupWidth));

    const belowTop = sentenceBottomRel + GAP_PX;
    const aboveTop = sentenceTopRel - popupHeight - GAP_PX;

    const wouldOverflowBottom = belowTop + popupHeight > containerHeight;
    const wouldOverflowTop = aboveTop < 0;

    let top = belowTop;

    if (wouldOverflowBottom && !wouldOverflowTop) {
      top = aboveTop;
    }

    top = clamp(top, 0, Math.max(0, containerHeight - popupHeight));

    setPopupPosition((prev) => {
      if (!prev) return { top, left };
      if (almostEqual(prev.top, top) && almostEqual(prev.left, left)) return prev;
      return { top, left };
    });
  };

  const toggleSentence = (index: number) => {
    if (selectedSentenceIndex === index) {
      setSelectedSentenceIndex(null);
      setPopupPosition(null);
      return;
    }

    setSelectedSentenceIndex(index);

    const sentenceEl = sentenceRefs.current[index];
    const containerEl = containerRef.current;

    if (sentenceEl && containerEl) {
      const sentenceRect = sentenceEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      // Rough initial position (below). useLayoutEffect will refine with actual popup size.
      const leftRel = sentenceRect.left - containerRect.left;
      const popupMaxWidth = containerRect.width * 0.9; // matches w-[90%]
      const clampedLeft = Math.min(Math.max(0, leftRel), containerRect.width - popupMaxWidth);

      setPopupPosition({
        top: sentenceRect.bottom - containerRect.top + GAP_PX,
        left: clampedLeft,
      });
    }
  };

  useEffect(() => {
    async function saveBookProgress() {
      try {
        await fetch("/api/reading/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: book.id, pageNumber: currentPage }),
        });
      } catch (error) {
        console.error("Failed to save book progress:", error);
      }
    }
    saveBookProgress();
  }, [book.id, currentPage]);

  const sentence =
    selectedSentenceIndex !== null &&
    selectedSentenceIndex >= 0 &&
    selectedSentenceIndex < pageData.bookSentences.length
      ? pageData.bookSentences[selectedSentenceIndex]
      : null;

  useLayoutEffect(() => {
    if (selectedSentenceIndex === null) return;
    if (!popupPosition) return;

    computeAndSetPopupPosition(selectedSentenceIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSentenceIndex, popupPosition?.top, popupPosition?.left]);

  useEffect(() => {
    if (selectedSentenceIndex === null) return;

    const onReflow = () => computeAndSetPopupPosition(selectedSentenceIndex);

    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, { passive: true, capture: true });

    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, { capture: true } as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSentenceIndex]);

  return (
    <div className="relative w-full p-4">
      <button
        onClick={onBack}
        className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white hover:opacity-90"
        aria-label="Back"
      >
        ←
      </button>

      <div className="text-center text-xl">
        {book.title} <span className="font-normal text-gray-600"> - {book.author}</span>
      </div>

      <div ref={containerRef} className="relative mt-4 rounded-lg p-4 text-justify leading-relaxed">
        {pageData.bookSentences.length > 0 ? (
          <p className="cursor-pointer transition duration-200">
            {book.bookPages[currentPage]?.bookSentences.map((sentenceItem, index) => (
              <span
                key={index}
                ref={(el) => {
                  sentenceRefs.current[index] = el;
                }}
                onClick={() => toggleSentence(index)}
                onMouseEnter={() => setHoveredSentenceIndex(index)}
                onMouseLeave={() => setHoveredSentenceIndex(null)}
                className={`transition duration-200 ${hoveredSentenceIndex === index ? "text-blue-600" : ""}`}
              >
                {sentenceItem.words.map((word: BookWord, wordIndex, array) => {
                  const nextWord = array[wordIndex + 1]?.word.text || "";
                  const isCurrentPunctuation = isPunctuation(word.word.text);
                  const isEndOfSentence = isSentenceEndingPunctuation(word.word.text);

                  return (
                    <span
                      key={word.id}
                      style={{
                        color: selectedSentenceIndex === index ? word.color : "inherit",
                      }}
                    >
                      {wordIndex > 0 && !isCurrentPunctuation ? " " : ""}
                      {word.word.text}
                      {isEndOfSentence ? " " : ""}
                    </span>
                  );
                })}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-center text-gray-500">No sentences available.</p>
        )}

        {sentence && popupPosition && (
          <div
            ref={popupRef}
            className="absolute z-50 w-[90%] max-w-xl rounded border p-3 shadow-xl"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
              backgroundColor: "hsl(24, 9.8%, 10%)",
            }}
          >
            <p className="text-white">
              <strong>Translation:</strong>{" "}
              {sentence.words
                .slice()
                .sort(
                  (a, b) =>
                    (a.translationOrder ?? a.order) - (b.translationOrder ?? b.order),
                )
                .map((word: BookWord, wordIndex) => (
                  <span key={word.id} style={{ color: word.color }}>
                    {wordIndex > 0 ? " " : ""}
                    {word.translation}
                  </span>
                ))}
            </p>

            <p className="text-white">
              <strong>Transliteration:</strong>{" "}
              {sentence.words
                .slice()
                .sort(
                  (a, b) =>
                    (a.transliterationOrder ?? a.order) -
                    (b.transliterationOrder ?? b.order),
                )
                .map((word: BookWord, wordIndex) => (
                  <span key={word.id} style={{ color: word.color }}>
                    {wordIndex > 0 ? " " : ""}
                    {word.transliteration}
                  </span>
                ))}
            </p>

            <ReadingBookmarkButton
              bookId={book.id}
              sentenceId={sentence.text}
              text={sentence.text}
              translation={sentence.translation}
              transliteration={sentence.transliteration}
              language={book.language}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center space-y-2">
        <input
          type="range"
          min="0"
          max={totalPages - 1}
          value={currentPage}
          onChange={(e) => setCurrentPage(Number(e.target.value))}
          className="w-3/4 cursor-pointer"
        />
        <p className="text-sm text-gray-600">
          Page {currentPage + 1} of {book.bookPages.length}
        </p>

        <div className="flex w-full max-w-xs justify-between">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= book.bookPages.length - 1}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, book.bookPages.length - 1))}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
