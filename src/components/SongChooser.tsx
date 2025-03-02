import { Song } from "@/lib/song"; // ✅ Ensure consistent type

interface SongChooserProps {
  songs: Song[];
  selectedSong: Song | null;
  onSelectSong: (song: Song) => void;
}

export default function SongChooser({ songs, selectedSong, onSelectSong }: SongChooserProps) {
  return (
    <div className="flex overflow-x-auto gap-4 w-full max-w-3xl bg-gray-100 rounded-lg p-2">
      {songs.map((song) => (
        <div
          key={song.id}
          className={`cursor-pointer p-3 border rounded-lg transition ${
            selectedSong?.id === song.id ? "bg-blue-500 text-white" : "bg-white"
          }`}
          onClick={() => onSelectSong(song)}
        >
          <h3 className="text-md font-semibold">{song.title}</h3>
          <p className="text-sm">{song.artist}</p>
        </div>
      ))}
    </div>
  );
}
