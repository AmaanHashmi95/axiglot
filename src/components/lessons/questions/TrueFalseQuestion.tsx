"use client";

interface Props {
  selectedAnswer: string | null;
  handleAnswer: (answer: string) => void;
}

export default function TrueFalseQuestion({
  selectedAnswer,
  handleAnswer,
}: Props) {
  return (
    <div className="mt-6 flex justify-center gap-6">
      <button
        onClick={() => handleAnswer("true")}
        className={`px-6 py-2 rounded-md text-white transition shadow-md ${
          selectedAnswer === "true"
            ? "bg-[#00E2FF]"
            : "bg-[#00E2FF] opacity-80 hover:opacity-100"
        }`}
      >
        True
      </button>
      <button
        onClick={() => handleAnswer("false")}
        className={`px-6 py-2 rounded-md text-white transition shadow-md ${
          selectedAnswer === "false"
            ? "bg-[#FF8A00]"
            : "bg-[#FF8A00] opacity-80 hover:opacity-100"
        }`}
      >
        False
      </button>
    </div>
  );
}
