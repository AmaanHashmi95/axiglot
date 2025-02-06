import React from 'react';
import VideoPlayer from '@/components/VideoPlayer';

const FilmTvPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Film & TV</h1>
      <VideoPlayer />
    </div>
  );
};

export default FilmTvPage;