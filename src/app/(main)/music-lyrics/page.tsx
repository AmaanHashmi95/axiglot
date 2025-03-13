"use client";

import { useEffect, useState, useCallback } from "react";
import SongChooser from "@/components/SongChooser";
import MusicPlayer from "@/components/MusicPlayer";
import Lyrics from "@/components/Lyrics";
import { Song } from "@/lib/song";

export default function Page() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLyrics, setShowLyrics] = useState(false);

  const API_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://axiglot.vercel.app";

  useEffect(() => {
    async function fetchSongs() {
      try {
        console.log("Fetching from API:", `${API_URL}/api/music`);
        const res = await fetch(`${API_URL}/api/music`);
        if (!res.ok)
          throw new Error(`Failed to fetch songs. Status: ${res.status}`);
        const fetchedSongs: Song[] = await res.json();
        if (fetchedSongs.length === 0)
          throw new Error("No songs available in the database.");

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

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden p-4">
      {showLyrics ? (
        selectedSong && <Lyrics song={selectedSong} currentTime={currentTime} />
      ) : (
        <SongChooser
          songs={songs}
          selectedSong={selectedSong}
          onSelectSong={setSelectedSong}
        />
      )}

      {/* Add padding to ensure space for MusicPlayer */}
      <div className="pb-24"></div>

      {selectedSong && (
        <MusicPlayer
          song={selectedSong}
          onTimeUpdate={setCurrentTime}
          showLyrics={showLyrics}
          setShowLyrics={setShowLyrics}
        />
      )}
    </div>
  );
}
