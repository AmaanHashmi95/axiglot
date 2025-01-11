import { useState, useEffect, useRef } from 'react';

interface DragDropAudioProps {
  audioUrl: string;
  words: string[];
  correctOrder: string[];
  onSubmit: (isCorrect: boolean) => void;
}

export default function DragDropAudio({ audioUrl, words, correctOrder, onSubmit }: DragDropAudioProps) {
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragItem = useRef<number | null>(null);

  // Auto-play audio on load
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Audio playback failed:', err));
    }
  }, []);

  // Drag start event
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  // Drag over event to allow drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Drop event to reorder words
  const handleDrop = (index: number) => {
    if (dragItem.current !== null) {
      const newOrder = [...userOrder];
      const draggedWord = words[dragItem.current];
      newOrder[index] = draggedWord;
      setUserOrder(newOrder);
    }
  };

  // Submit and check order
  const handleSubmit = () => {
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    onSubmit(isCorrect);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <audio ref={audioRef} src={audioUrl} autoPlay />
      <div className="text-xl mt-6">Drag the words into the correct order:</div>

      {/* Drop Zones */}
      <div className="flex space-x-4 mt-6">
        {correctOrder.map((_, index) => (
          <div
            key={index}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="w-24 h-12 border-2 border-dashed flex items-center justify-center"
          >
            {userOrder[index] || 'Drop here'}
          </div>
        ))}
      </div>

      {/* Draggable Words */}
      <div className="flex gap-4 mt-8">
        {words.map((word, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            className="bg-blue-200 px-4 py-2 rounded shadow cursor-pointer"
          >
            {word}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="btn btn-primary mt-6">
        Submit
      </button>
    </div>
  );
}
