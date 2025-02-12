import MusicPlayer from "@/components/MusicPlayer";

const API_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchSong() {
  const res = await fetch(`${API_URL}/api/music`);
  const songs = await res.json();
  return songs[0]; // Get the first song
}

export default async function Page() {
  const song = await fetchSong();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {song ? <MusicPlayer song={song} /> : <p>Loading...</p>}
    </div>
  );
}
