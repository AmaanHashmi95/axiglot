"use client"; // ✅ Ensures fetch happens on client-side

import MusicPlayer from "@/components/MusicPlayer";
import { useEffect, useState } from "react";

export default function Page() {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    typeof window !== "undefined"
      ? window.location.origin // ✅ Auto-detects correct base URL
      : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";

  useEffect(() => {
    async function fetchSong() {
      try {
        console.log("Fetching from API:", `${API_URL}/api/music`); // ✅ Debugging log

        const res = await fetch(`${API_URL}/api/music`);
        console.log("Fetch response:", res);

        if (!res.ok) {
          throw new Error(`Failed to fetch song. Status: ${res.status}`);
        }

        const songs = await res.json();
        console.log("Fetched songs:", songs);

        if (songs.length === 0) {
          throw new Error("No songs available in the database.");
        }

        setSong(songs[0]); // Get the first song
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSong();
  }, [API_URL]); // ✅ Re-fetch when API URL changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {song ? <MusicPlayer song={song} /> : <p>No song available</p>}
    </div>
  );
}
