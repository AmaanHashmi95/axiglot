"use client"; // ✅ Ensures fetch happens on client-side

import MusicPlayer from "@/components/MusicPlayer";
import { useEffect, useState } from "react";

export default function Page() {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSong() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";
        const res = await fetch(`${API_URL}/api/music`);

        if (!res.ok) throw new Error("Failed to fetch song");

        const songs = await res.json();
        setSong(songs[0]); // Get the first song
      } catch (err: any) {
        setError("Failed to load music.");
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSong();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {song ? <MusicPlayer song={song} /> : <p>No song available</p>}
    </div>
  );
}
