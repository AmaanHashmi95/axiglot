import { useState, useRef, useEffect } from 'react';

interface DragDropAudioProps {
  audioUrl: string;
  words: string[];
  correctOrder: string[];
  onSubmit: (isCorrect: boolean) => void;
}

export default function DragDropAudio({ audioUrl, words, correctOrder, onSubmit }: DragDropAudioProps) {
  const [userOrder, setUserOrder] = useState<(string | null)[]>(Array(correctOrder.length).fill(null));
  const [availableWords, setAvailableWords] = useState<string[]>(words);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play audio on load
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error('Audio playback failed:', err));
    }
  }, []);

  // Handle word selection (placing a word into the next available slot)
  const handleSelectWord = (word: string) => {
    const emptyIndex = userOrder.indexOf(null);
    if (emptyIndex !== -1) {
      const newOrder = [...userOrder];
      newOrder[emptyIndex] = word;

      setUserOrder(newOrder);
      setAvailableWords(availableWords.filter((w) => w !== word));
    }
  };

  // Handle removing a placed word (returning it to the selection area)
  const handleRemoveWord = (index: number) => {
    const wordToRemove = userOrder[index];
    if (wordToRemove !== null) {
      const newOrder = [...userOrder];
      newOrder[index] = null;

      setUserOrder(newOrder);
      setAvailableWords([...availableWords, wordToRemove]);
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
      <div className="text-xl mt-6">Tap the words in the correct order:</div>

      {/* Drop Zones */}
      <div className="flex space-x-4 mt-6">
        {userOrder.map((word, index) => (
          <div
            key={index}
            onClick={() => handleRemoveWord(index)} // Allow removal
            className={`w-24 h-12 border-2 flex items-center justify-center cursor-pointer ${
              word ? 'bg-green-200' : 'border-dashed'
            }`}
          >
            {word || 'Tap here'}
          </div>
        ))}
      </div>

      {/* Selectable Words */}
      <div className="flex gap-4 mt-8">
        {availableWords.map((word, index) => (
          <div
            key={index}
            onClick={() => handleSelectWord(word)} // Handle taps
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
