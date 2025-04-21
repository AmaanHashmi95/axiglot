import { useState, useRef, useEffect } from 'react';

interface DragDropAudioProps {
  audioUrl: string;
  words: string[];
  correctOrder: string[];
  onSubmit: (isCorrect: boolean) => void;
}

export default function DragDropAudio({
  audioUrl,
  words,
  correctOrder,
  onSubmit,
}: DragDropAudioProps) {
  const [userOrder, setUserOrder] = useState<(string | null)[]>(
    Array(correctOrder.length).fill(null)
  );
  const [availableWords, setAvailableWords] = useState<string[]>(words);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordWidthsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error('Audio playback failed:', err));
    }
  }, []);

  useEffect(() => {
    if (!userOrder.includes(null)) {
      const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
      setIsCorrectAnswer(isCorrect);
      onSubmit(isCorrect);
    }
  }, [userOrder, correctOrder, onSubmit]);

  const handleSelectWord = (word: string) => {
    const emptyIndex = userOrder.indexOf(null);
    if (emptyIndex !== -1) {
      const newOrder = [...userOrder];
      newOrder[emptyIndex] = word;
      setUserOrder(newOrder);

      const indexToRemove = availableWords.indexOf(word);
      if (indexToRemove !== -1) {
        const newAvailable = [...availableWords];
        newAvailable.splice(indexToRemove, 1);
        setAvailableWords(newAvailable);
      }
    }
  };

  const handleRemoveWord = (index: number) => {
    const wordToRemove = userOrder[index];
    if (wordToRemove !== null) {
      const newOrder = [...userOrder];
      newOrder[index] = null;
      setUserOrder(newOrder);
      setAvailableWords([...availableWords, wordToRemove]);
      setIsCorrectAnswer(null);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <audio ref={audioRef} src={audioUrl} autoPlay />

      {/* Drop Zones */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {userOrder.map((word, index) => {
          let bgClass = word
            ? 'bg-gray-600'
            : 'border-dashed border-gray-400 text-gray-400';

          if (word && isCorrectAnswer !== null) {
            bgClass = isCorrectAnswer
              ? 'bg-gradient-to-r from-[#00E2FF] to-[#00C2FF] text-white'
              : 'bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white';
          }

          const wordWidth = word ? wordWidthsRef.current[word] : 80;

          return (
            <div
              key={index}
              onClick={() => handleRemoveWord(index)}
              className={`h-12 px-3 border-2 flex items-center justify-center cursor-pointer text-center rounded-lg ${bgClass}`}
              style={{ width: `${wordWidth || 80}px` }}
            >
              {word || ''}
            </div>
          );
        })}
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {availableWords.map((word, index) => (
          <div
            key={index}
            onClick={() => handleSelectWord(word)}
            ref={(el) => {
              if (el) wordWidthsRef.current[word] = el.offsetWidth;
            }}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg shadow text-lg cursor-pointer transition inline-block"
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
