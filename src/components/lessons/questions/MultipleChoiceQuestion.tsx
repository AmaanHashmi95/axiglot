"use client";

interface Props {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  handleAnswer: (answer: string) => void;
}

export default function MultipleChoiceQuestion({
  options,
  selectedAnswer,
  correctAnswer,
  handleAnswer,
}: Props) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = selectedAnswer === correctAnswer && option === selectedAnswer;
        const isIncorrect = selectedAnswer !== null && selectedAnswer !== correctAnswer && option === selectedAnswer;

        let bgClass = "bg-[#f0f0f0] hover:bg-gray-300 text-gray-800";

        if (isCorrect) {
          bgClass = "bg-gradient-to-r from-[#00E2FF] to-[#00C2FF] text-white";
        } else if (isIncorrect) {
          bgClass = "bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white";
        }

        return (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`w-full rounded-md px-5 py-3 text-lg md:text-xl transition ${bgClass}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
