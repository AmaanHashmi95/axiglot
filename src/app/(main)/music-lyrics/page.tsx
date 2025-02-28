"use client";

import MusicPlayer from "@/components/MusicPlayer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// ✅ TypeScript interfaces
interface Word {
  word: string;
  startTime: number;
  endTime: number;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  englishSentences: Sentence[];
  targetSentences: Sentence[];
  transliterationSentences: Sentence[];
}

export default function Page() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";

  useEffect(() => {
    async function fetchSongs() {
      try {
        console.log("Fetching from API:", `${API_URL}/api/music`);
        const res = await fetch(`${API_URL}/api/music`);
        if (!res.ok) throw new Error(`Failed to fetch songs. Status: ${res.status}`);
        const fetchedSongs: Song[] = await res.json();
        if (fetchedSongs.length === 0) throw new Error("No songs available in the database.");

        setSongs(fetchedSongs);
        setSelectedSong(fetchedSongs[0]); // ✅ Default to first song
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [API_URL]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      {/* ✅ Song Selection Carousel */}
      <div className="flex overflow-x-auto gap-4 p-4 w-full max-w-3xl">
        {songs.map((song) => (
          <div
            key={song.id}
            className={`cursor-pointer p-3 border rounded-lg transition ${
              selectedSong?.id === song.id ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => setSelectedSong(song)}
          >
            <h3 className="text-md font-semibold">{song.title}</h3>
            <p className="text-sm">{song.artist}</p>
          </div>
        ))}
      </div>

      {/* ✅ Single Music Player */}
      {selectedSong && <MusicPlayer song={selectedSong} />}
    </div>
  );
}
