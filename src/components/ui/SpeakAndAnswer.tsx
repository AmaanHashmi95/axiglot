import { useState, useRef } from 'react';

interface SpeakAndAnswerProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean) => void;
}

export default function SpeakAndAnswer({ correctAnswer, onSubmit }: SpeakAndAnswerProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Speech Recognition
  const startRecording = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setFeedback(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(transcript);
        validateAnswer(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setFeedback('Speech recognition error. Please try again.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      setFeedback('Speech recognition not supported in this browser.');
    }
  };

  // Validate Answer
  const validateAnswer = (answer: string) => {
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setFeedback(isCorrect ? 'Correct!' : 'Try again.');
    onSubmit(isCorrect);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <p className="text-xl mb-4">Speak the answer:</p>

      <div className="border p-4 w-64 text-center bg-gray-100">
        {userAnswer || 'Your answer will appear here...'}
      </div>

      <button
        onClick={startRecording}
        className={`btn btn-primary mt-6 ${isRecording ? 'opacity-50' : ''}`}
        disabled={isRecording}
      >
        {isRecording ? 'Recording...' : 'Start Speaking'}
      </button>

      {feedback && (
        <p className={`mt-4 ${feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}
