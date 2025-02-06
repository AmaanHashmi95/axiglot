// src/components/VideoPlayer.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import ky from 'ky';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Settings } from 'lucide-react';


type VideoData = {
  id: string;
  url: string;
};

const VideoPlayer: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await ky.get('/api/video').json<VideoData[]>();
        setVideos(data);
        if (data.length > 0) setSelectedVideo(data[0]); // Default to first video
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  const handleProgress = (state: { played: number }) => {
    setProgress(state.played * 100);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value) / 100;
    playerRef.current?.seekTo(newTime, 'fraction');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 text-center">Select a Video</h1>
      <div className="flex gap-4 overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedVideo?.id === video.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Video {video.id.slice(-4)}
          </button>
        ))}
      </div>
      {selectedVideo && (
        <div className="relative mt-6 flex flex-col items-center w-full rounded-lg overflow-hidden shadow-lg">
          <ReactPlayer
            ref={playerRef}
            url={selectedVideo.url}
            playing={isPlaying}
            volume={volume}
            playbackRate={playbackSpeed}
            onProgress={handleProgress}
            width="100%"
            height="auto"
            controls={false} // Hide default controls
          />
          
          {/* Custom Controls */}
          <div className="w-full bg-black/80 text-white p-3 rounded-b-lg mt-[-4px]">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer"
            />

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mt-2">
              <button onClick={() => playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 15, 'seconds')}>
                <SkipBack size={24} />
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={30} /> : <Play size={30} />}
              </button>
              <button onClick={() => playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 15, 'seconds')}>
                <SkipForward size={24} />
              </button>

              {/* Volume Control */}
              <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              
              {/* Playback Speed */}
              <button onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : 1)}>
                <Settings size={24} /> {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
