import { useState, useEffect, useRef } from 'react';
import CustomKeyboard from './CustomKeyboard';

interface ListenAndTypeProps {
  audioUrl: string;
  correctAnswer: string;
  language: string;  // Pass language to determine keyboard layout
  onSubmit: (isCorrect: boolean) => void;
}

export default function ListenAndType({ audioUrl, correctAnswer, language, onSubmit }: ListenAndTypeProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Automatically play audio when component loads
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error('Audio playback failed:', err));
    }
  }, []);

  const handleKeyPress = (key: string) => {
    setUserAnswer((prev) => prev + key);
  };

  const handleBackspace = () => {
    setUserAnswer((prev) => prev.slice(0, -1));
  };


  // Handle form submission
  const handleSubmit = () => {
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setFeedback(isCorrect ? 'Correct!' : 'Try again.');
    onSubmit(isCorrect);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <audio ref={audioRef} src={audioUrl} autoPlay controls className="mb-4" />

      <p className="text-lg mb-4">Type what you hear:</p>

      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="input input-bordered w-64 p-2 text-center"
        placeholder="Type your answer"
      />

<CustomKeyboard
        language={language}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
      />

      <button onClick={handleSubmit} className="btn btn-primary mt-4">
        Submit
      </button>

      {feedback && (
        <p className={`mt-4 ${feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}
