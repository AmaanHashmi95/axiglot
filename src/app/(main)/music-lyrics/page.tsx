import MusicPlayer from "@/components/MusicPlayer";

async function fetchSong() {
  const res = await fetch("http://localhost:3000/api/music");
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
