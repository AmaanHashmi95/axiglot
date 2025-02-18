import { useState, useEffect, useRef } from 'react';

interface DragDropAudioProps {
  audioUrl: string;
  words: string[];
  correctOrder: string[];
  onSubmit: (isCorrect: boolean) => void;
}

export default function DragDropAudio({ audioUrl, words, correctOrder, onSubmit }: DragDropAudioProps) {
  const [userOrder, setUserOrder] = useState<string[]>(Array(correctOrder.length).fill(null));
  const [draggingWord, setDraggingWord] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Audio playback failed:', err));
    }
  }, []);

  /** DRAG & DROP HANDLERS FOR DESKTOP **/
  const handleDragStart = (word: string) => {
    setDraggingWord(word);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggingWord) {
      const newOrder = [...userOrder];
      newOrder[index] = draggingWord;
      setUserOrder(newOrder);
      setDraggingWord(null);
    }
  };

  /** TOUCH HANDLERS FOR MOBILE **/
  const handleTouchStart = (word: string) => {
    setDraggingWord(word);
  };

  const handleTouchEnd = (index: number) => {
    if (draggingWord) {
      const newOrder = [...userOrder];
      newOrder[index] = draggingWord;
      setUserOrder(newOrder);
      setDraggingWord(null);
    }
  };

  /** SUBMIT FUNCTION **/
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
            onTouchEnd={() => handleTouchEnd(index)}
            className="w-24 h-12 border-2 border-dashed flex items-center justify-center text-gray-700 bg-gray-100 rounded-md"
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
            onDragStart={() => handleDragStart(word)}
            onTouchStart={() => handleTouchStart(word)}
            className="bg-blue-200 px-4 py-2 rounded shadow cursor-pointer select-none"
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
