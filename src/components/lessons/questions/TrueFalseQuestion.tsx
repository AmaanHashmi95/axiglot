"use client";

interface Props {
  selectedAnswer: string | null;
  handleAnswer: (answer: string) => void;
}

export default function TrueFalseQuestion({ selectedAnswer, handleAnswer }: Props) {
  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={() => handleAnswer("true")}
        className={`btn ${selectedAnswer === "true" ? "btn-primary" : "btn-secondary"}`}
      >
        True
      </button>
      <button
        onClick={() => handleAnswer("false")}
        className={`btn ${selectedAnswer === "false" ? "btn-primary" : "btn-secondary"}`}
      >
        False
      </button>
    </div>
  );
}
