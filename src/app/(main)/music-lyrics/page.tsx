"use client"; // ✅ Ensures fetch happens on client-side

import MusicPlayer from "@/components/MusicPlayer";
import { useEffect, useState } from "react";

// Define TypeScript interface for a song
interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  lyrics: string;
}

export default function Page() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    typeof window !== "undefined"
      ? window.location.origin // ✅ Auto-detects correct base URL
      : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";

  useEffect(() => {
    async function fetchSongs() {
      try {
        console.log("Fetching from API:", `${API_URL}/api/music`);

        const res = await fetch(`${API_URL}/api/music`);
        console.log("Fetch response:", res);

        if (!res.ok) {
          throw new Error(`Failed to fetch songs. Status: ${res.status}`);
        }

        const fetchedSongs: Song[] = await res.json(); // Explicitly type fetched data
        console.log("Fetched songs:", fetchedSongs);

        if (fetchedSongs.length === 0) {
          throw new Error("No songs available in the database.");
        }

        setSongs(fetchedSongs);
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
      {songs.length > 0 ? (
        songs.map((song: Song) => <MusicPlayer key={song.id} song={song} />)
      ) : (
        <p>No songs available</p>
      )}
    </div>
  );
}
