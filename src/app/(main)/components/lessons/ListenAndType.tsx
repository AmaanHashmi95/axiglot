import { useState, useEffect, useRef } from "react";
import CustomKeyboard from "./CustomKeyboard";
import { FaKeyboard, FaArrowRight } from "react-icons/fa";

interface ListenAndTypeProps {
  audioUrl: string;
  correctAnswer: string;
  language: string;
  onSubmit: (isCorrect: boolean) => void;
}

export default function ListenAndType({
  audioUrl,
  correctAnswer,
  language,
  onSubmit,
}: ListenAndTypeProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Audio playback failed:", err));
    }
  }, []);

  const handleKeyPress = (key: string) => {
    setUserAnswer((prev) => prev + key);
  };

  const handleBackspace = () => {
    setUserAnswer((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    const isCorrect =
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setFeedback(isCorrect ? "Correct!" : "Try again.");
    onSubmit(isCorrect);
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      <audio
        ref={audioRef}
        src={audioUrl}
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        className="custom-audio mb-4"
      />

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="input input-bordered w-64 rounded-lg bg-gray-500 p-2 text-center"
          placeholder="Type your answer"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowKeyboard((prev) => !prev)}
          className="bg-gray-700 text-white rounded-full p-3 hover:bg-gray-600 transition"
        >
          <FaKeyboard />
        </button>

        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-[#00E2FF] to-[#00C2FF] text-white rounded-full p-3 hover:opacity-90 transition"
        >
          <FaArrowRight />
        </button>
      </div>

      {showKeyboard && (
        <div className="mt-4">
          <CustomKeyboard language={language} onKeyPress={handleKeyPress} />
        </div>
      )}
    </div>
  );
}
