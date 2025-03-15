import { useState } from "react";
import { Book, BookSentence, BookWord } from "@/lib/book";

interface ReadingProps {
  book: Book;
}

export default function Reading({ book }: ReadingProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [hoveredSentenceIndex, setHoveredSentenceIndex] = useState<number | null>(null);

  // Ensure bookPages is available
  const bookPages = book.bookPages || [];
  const totalPages = bookPages.length;
  const pageData = bookPages[currentPage] || { bookSentences: [] };

  const toggleSentence = (index: number) => {
    setSelectedSentenceIndex(selectedSentenceIndex === index ? null : index);
  };

  // ✅ Function to check if a word is punctuation
  const isPunctuation = (text: string) => /^[.,!?;:"'()\-—]+$/.test(text);

  // ✅ Function to check if punctuation is sentence-ending
  const isSentenceEndingPunctuation = (text: string) => /[.!?]+$/.test(text);

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold text-center">{book.title}</h2>
      <p className="text-center text-gray-600">{book.author}</p>

      {/* ✅ Main Content Area */}
      <div className="border p-4 rounded-lg mt-4 text-justify leading-relaxed">
        {pageData.bookSentences.length > 0 ? (
          <p className="cursor-pointer transition duration-200">
            {pageData.bookSentences.map((sentence: BookSentence, index: number) => (
              <span
                key={index}
                onClick={() => toggleSentence(index)}
                onMouseEnter={() => setHoveredSentenceIndex(index)}
                onMouseLeave={() => setHoveredSentenceIndex(null)}
                className={`transition duration-200 ${
                  hoveredSentenceIndex === index ? "text-blue-600" : ""
                }`}
              >
                {sentence.words.map((word: BookWord, wordIndex, array) => {
                  const nextWord = array[wordIndex + 1]?.word.text || "";
                  const isNextPunctuation = isPunctuation(nextWord);
                  const isCurrentPunctuation = isPunctuation(word.word.text);
                  const isEndOfSentence = isSentenceEndingPunctuation(word.word.text);

                  return (
                    <span
                      key={word.id}
                      style={{ color: selectedSentenceIndex === index ? word.color : "inherit" }}
                    >
                      {/* ✅ Add space between words but NOT before punctuation */}
                      {wordIndex > 0 && !isCurrentPunctuation ? " " : ""}
                      {word.word.text}
                      {/* ✅ Add space *after* sentence-ending punctuation */}
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
      </div>

      {/* ✅ Sentence dropdown content */}
      {selectedSentenceIndex !== null && (
        <div className="mt-2 p-2 border rounded bg-gray-100 shadow-sm">
          <p className="text-gray-700">
            <strong>Translation:</strong>{" "}
            {pageData.bookSentences[selectedSentenceIndex]?.words
              .slice()
              .sort((a, b) => (a.translationOrder ?? a.order) - (b.translationOrder ?? b.order))
              .map((word: BookWord, wordIndex, array) => (
                <span key={word.id} style={{ color: word.color }}>
                  {wordIndex > 0 ? " " : ""}
                  {word.translation}
                </span>
              ))}
          </p>
          <p className="text-gray-600">
            <strong>Transliteration:</strong>{" "}
            {pageData.bookSentences[selectedSentenceIndex]?.words
              .slice()
              .sort((a, b) => (a.transliterationOrder ?? a.order) - (b.transliterationOrder ?? b.order))
              .map((word: BookWord, wordIndex, array) => (
                <span key={word.id} style={{ color: word.color }}>
                  {wordIndex > 0 ? " " : ""}
                  {word.transliteration}
                </span>
              ))}
          </p>
        </div>
      )}

      {/* ✅ Page Navigation */}
      <div className="flex flex-col items-center mt-4 space-y-2">
        {/* Quick Page Scroller (Slider) */}
        <input
          type="range"
          min="0"
          max={totalPages - 1}
          value={currentPage}
          onChange={(e) => setCurrentPage(Number(e.target.value))}
          className="w-3/4 cursor-pointer"
        />
        <p className="text-gray-600 text-sm">
          Page {currentPage + 1} of {totalPages}
        </p>

        {/* Previous & Next Buttons */}
        <div className="flex justify-between w-full max-w-xs">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
