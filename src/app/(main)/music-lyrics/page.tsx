"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SongChooser from "@/components/SongChooser";
import MusicPlayer from "@/components/MusicPlayer";
import Lyrics from "@/components/Lyrics";
import { Song } from "@/lib/song";
import { Loader2 } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const songId = searchParams.get("songId");
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
        // Auto-select song if `songId` exists in the URL
        if (songId) {
          const autoSelectedSong = fetchedSongs.find((s) => s.id === songId);
          if (autoSelectedSong) {
            setSelectedSong(autoSelectedSong);
            setShowLyrics(true);
          }
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [songId]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  if (loading) return <Loader2 className="mx-auto my-3 animate-spin" />;
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
