"use client";

interface Props {
  options: string[];
  selectedAnswer: string | null;
  handleAnswer: (answer: string) => void;
}

export default function MultipleChoiceQuestion({ options, selectedAnswer, handleAnswer }: Props) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleAnswer(option)}
          className={`btn ${
            selectedAnswer === option ? "btn-primary" : "btn-secondary"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
