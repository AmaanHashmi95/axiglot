"use client";

import { useEffect, useState, useCallback } from "react";
import ReadingChooser from "@/components/ReadingChooser";
import Reading from "@/components/Reading";
import { Book } from "@/lib/book";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";

  useEffect(() => {
    async function fetchBooks() {
      try {
        console.log("Fetching from API:", `${API_URL}/api/reading`);
        const res = await fetch(`${API_URL}/api/reading`);
        if (!res.ok)
          throw new Error(`Failed to fetch books. Status: ${res.status}`);
        const fetchedBooks: Book[] = await res.json();
        if (fetchedBooks.length === 0)
          throw new Error("No books available in the database.");

        setBooks(fetchedBooks);
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [API_URL]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackToChooser = () => {
    setSelectedBook(null);
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="relative flex w-full flex-col gap-4 overflow-hidden p-4">
      {selectedBook ? (
        <>
          <Reading book={selectedBook} />
          <Button onClick={handleBackToChooser} className="mt-4">
            Back to Book Selection
          </Button>
        </>
      ) : (
        <ReadingChooser
          books={books}
          selectedBook={selectedBook}
          onSelectBook={handleSelectBook}
        />
      )}
    </div>
  );
}
