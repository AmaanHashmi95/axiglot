import { useState, useRef } from "react";

interface SpeakAndAnswerProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean) => void;
}

export default function SpeakAndAnswer({ correctAnswer, onSubmit }: SpeakAndAnswerProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let stopTimeout: NodeJS.Timeout | null = null;

  const startRecording = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setFeedback("❌ Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US"; // Default for English/Punjabi transliteration
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setFeedback(null);

      stopTimeout = setTimeout(() => {
        recognition.stop();
      }, 5000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = event.results[0][0].transcript.trim();
      console.log("Recognized Speech:", transcript);

      setUserAnswer(transcript);
      validateAnswer(transcript);

      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (stopTimeout) clearTimeout(stopTimeout);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setFeedback("❌ Speech recognition error. Please try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const validateAnswer = (spokenText: string) => {
    const normalizedSpoken = normalizeText(spokenText);
    const normalizedCorrect = normalizeText(correctAnswer);

    console.log("Normalized Spoken:", normalizedSpoken);
    console.log("Normalized Correct:", normalizedCorrect);

    if (normalizedSpoken === normalizedCorrect) {
      setFeedback("✅ Correct!");
      onSubmit(true);
    } else {
      setFeedback("❌ Try again.");
      onSubmit(false);
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Remove extra spaces
      .trim();
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <p className="text-xl mb-4">Speak the answer:</p>

      <div className="border p-4 w-64 text-center bg-gray-100">
        {userAnswer || "Your answer will appear here..."}
      </div>

      <button
        onClick={startRecording}
        className={`btn btn-primary mt-6 ${isRecording ? "opacity-50" : ""}`}
        disabled={isRecording}
      >
        {isRecording ? "Recording..." : "Start Speaking"}
      </button>

      {feedback && <p className={`mt-4 ${feedback.includes("✅") ? "text-green-500" : "text-red-500"}`}>{feedback}</p>}
    </div>
  );
}
