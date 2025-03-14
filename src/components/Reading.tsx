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
  const pageData = bookPages[currentPage] || { bookSentences: [] };

  const toggleSentence = (index: number) => {
    setSelectedSentenceIndex(selectedSentenceIndex === index ? null : index);
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold text-center">{book.title}</h2>
      <p className="text-center text-gray-600">{book.author}</p>

      <div className="border p-4 rounded-lg mt-4 text-justify leading-relaxed">
        {pageData.bookSentences.length > 0 ? (
          <p className="cursor-pointer transition duration-200">
            {pageData.bookSentences.map((sentence: BookSentence, index: number) => {
              // ✅ Join words with a space, then remove space before punctuation and ensure space after punctuation
              const formattedSentence = sentence.words
                .sort((a, b) => a.order - b.order)
                .map((word: BookWord) => word.word.text)
                .join(" ") // ✅ Add spaces between words
                .replace(/\s([.,!?;:])/g, "$1") // ✅ Remove space before punctuation
                .replace(/([.,!?;:])(\S)/g, "$1 $2") // ✅ Ensure space *after* punctuation
                .trim() + ". "; // ✅ Add a full stop manually if missing

              return (
                <span
                  key={index}
                  onClick={() => toggleSentence(index)}
                  onMouseEnter={() => setHoveredSentenceIndex(index)}
                  onMouseLeave={() => setHoveredSentenceIndex(null)}
                  className={`transition duration-200 ${
                    hoveredSentenceIndex === index ? "text-blue-600" : ""
                  }`}
                >
                  {formattedSentence}
                </span>
              );
            })}
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
              .map((word: BookWord) => (
                <span key={word.id} style={{ color: word.color }}>
                  {word.translation}{" "}
                </span>
              ))}
          </p>
          <p className="text-gray-600">
            <strong>Transliteration:</strong>{" "}
            {pageData.bookSentences[selectedSentenceIndex]?.words
              .slice()
              .sort((a, b) => (a.transliterationOrder ?? a.order) - (b.transliterationOrder ?? b.order))
              .map((word: BookWord) => (
                <span key={word.id} style={{ color: word.color }}>
                  {word.transliteration}{" "}
                </span>
              ))}
          </p>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={currentPage >= bookPages.length - 1}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, bookPages.length - 1))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
