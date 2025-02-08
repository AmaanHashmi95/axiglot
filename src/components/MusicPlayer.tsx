// src/components/MusicPlayer.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import ky from 'ky';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface MusicData {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: { time: number; text: string }[]; // Synchronized lyrics
}

const MusicPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<MusicData[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<MusicData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLyric, setCurrentLyric] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await ky.get('/api/music').json<MusicData[]>();
        setTracks(data);
        if (data.length > 0) setSelectedTrack(data[0]);
      } catch (error) {
        console.error('Error fetching music:', error);
      }
    };
    fetchTracks();
  }, []);

  const handleProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
      if (selectedTrack?.lyrics) {
        const lyric = selectedTrack.lyrics.find((l) => currentTime >= l.time);
        if (lyric) setCurrentLyric(lyric.text);
      }
    }
  };

  

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 text-center">Select a Song</h1>
      <div className="flex gap-4 overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setSelectedTrack(track)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedTrack?.id === track.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {track.title} - {track.artist}
          </button>
        ))}
      </div>
      {selectedTrack && (
        <div className="relative mt-6 flex flex-col items-center w-full rounded-lg overflow-hidden shadow-lg">
          <h2 className="text-lg font-semibold">{selectedTrack.title} - {selectedTrack.artist}</h2>
          <audio
            ref={audioRef}
            src={selectedTrack.url}
            onTimeUpdate={handleProgress}
            onEnded={() => setIsPlaying(false)}
          />
          
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => {
              const newTime = (parseFloat(e.target.value) / 100) * (audioRef.current?.duration || 0);
              if (audioRef.current) audioRef.current.currentTime = newTime;
            }}
            className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer mt-2"
          />
          
          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-2">
            <button onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)}>
              <SkipBack size={24} />
            </button>
            <button onClick={() => {
              if (audioRef.current) {
                if (isPlaying) {
                  audioRef.current.pause();
                } else {
                  audioRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}>
              {isPlaying ? <Pause size={30} /> : <Play size={30} />}
            </button>
            <button onClick={() => audioRef.current && (audioRef.current.currentTime += 10)}>
              <SkipForward size={24} />
            </button>
          </div>
          
          {/* Lyrics Display */}
          <div className="mt-4 p-2 text-center bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md">
            <p className="text-lg font-semibold">{currentLyric || '♪♪♪'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
