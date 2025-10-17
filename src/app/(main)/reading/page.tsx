"use client";

import { useEffect, useMemo, useState } from "react"; // ⬅️ useMemo
import { useSearchParams } from "next/navigation";
import ReadingChooser from "@/app/(main)/reading/ReadingChooser";
import Reading from "@/app/(main)/reading/Reading";
import { Book } from "@/lib/book";
import { Loader2 } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");
  const pageNumber = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 0;

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ⬅️ Memoize so ESLint doesn't complain + it's stable
  const API_URL = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app",
    []
  );

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch(`${API_URL}/api/reading`);
        if (!res.ok) throw new Error(`Failed to fetch books. Status: ${res.status}`);
        const fetchedBooks: Book[] = await res.json();
        if (fetchedBooks.length === 0) throw new Error("No books available in the database.");

        setBooks(fetchedBooks);

        if (bookId) {
          const autoSelectedBook = fetchedBooks.find((b) => b.id === bookId);
          if (autoSelectedBook) setSelectedBook(autoSelectedBook);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [API_URL, bookId, pageNumber]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackToChooser = () => {
    setSelectedBook(null);
  };

  if (loading) return <Loader2 className="mx-auto my-3 animate-spin" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="relative flex w-full flex-col gap-4 overflow-hidden p-4">
      {selectedBook ? (
        <>
          <Reading book={selectedBook} onBack={handleBackToChooser} />
        </>
      ) : (
        <ReadingChooser
          books={books}
          selectedBook={selectedBook}
          onSelectBook={handleSelectBook}
        />
      )}
      <>Please be patient as we upload more reading material over the coming days - watch this space!</>
    </div>
  );
}
