'use client';
import { useState, useRef, useEffect } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import DrawCanvas from '@/components/ui/DrawCanvas';
import DragDropAudio from '@/components/ui/DragDropAudio';
import ListenAndType from '@/components/ui/ListenAndType';
import SpeakAndAnswer from '@/components/ui/SpeakAndAnswer';
import AudioRecorder from '@/components/ui/AudioRecorder';
import Timer from '@/components/ui/Timer';

interface Lesson {
  id: string;
  title: string;
  language: string;
  description?: string | null;
  questions: Question[]; // Ensure this aligns with your schema
}

interface Question {
  content: string;
  options?: string[];
  audioUrl?: string | null;
  correctAnswer: string;
  type: string;
  language?: string | null; // New field for script/language
  hasTimer?: boolean; // Determines if this question has a timer
}

interface LessonComponentProps {
  lesson: Lesson;
  userId: string; // Add userId as a prop
}


export default function LessonComponent({ lesson, userId }: LessonComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number[]>([]); // Tracks 1 for correct, 0 for incorrect
  const [lessonComplete, setLessonComplete] = useState(false);

  const question = lesson.questions[currentQuestion];

  // Adjust timer duration based on performance
  useEffect(() => {
    console.log(`User ID: ${userId}`); // Log the userId to verify it's passed correctly
    if (question.hasTimer) {
      const baseTime = 30; // Base time in seconds
      const adjustment = performance.slice(-3).reduce((sum, val) => sum + val, 0); // Last 3 answers
      const newTime = baseTime + adjustment * 5; // +5 seconds for each correct answer
      setTimeLeft(newTime > 10 ? newTime : 10); // Minimum 10 seconds
    } else {
      setTimeLeft(null);
    }
  }, [currentQuestion, question.hasTimer, performance, userId]);

  const handleTimeout = () => {
    setFeedback('Time’s up!');
  };

  const playAudio = (audioUrl: string | null | undefined) => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
      });
    } else {
      console.error('Audio URL is missing or invalid.');
    }
  };

  // Handle speak-and-answer submission
  const handleSpeakSubmit = (isCorrect: boolean) => {
    setFeedback(isCorrect ? 'Correct!' : 'Try again.');
  };

  // Handle submission for drag-and-drop audio questions
  const handleDropSubmit = (isCorrect: boolean) => {
    setFeedback(isCorrect ? 'Correct!' : 'Try again.');
  };

  // Handle listen-and-type submission
  const handleListenSubmit = (isCorrect: boolean) => {
    setFeedback(isCorrect ? 'Correct!' : 'Try again.');
  };

  // Handle answer selection or text input submission
  const handleAnswer = (option: string) => {
    const isCorrect = option === question.correctAnswer; // Define isCorrect here
    setSelectedAnswer(option);
    setFeedback(isCorrect ? 'Correct!' : 'Try again.');
    setPerformance((prev) => [...prev, isCorrect ? 1 : 0]); // Update performance
  };

  // Handle submission of canvas drawing
  const handleDrawingSubmit = (dataUrl: string) => {
    console.log('Drawing submitted:', dataUrl);
    setFeedback('Drawing submitted successfully!');
  };

  const handleSubmitTextAnswer = () => {
    if (typedAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
      setFeedback('Correct!');
    } else {
      setFeedback('Try again.');
    }
  };

  const handleNext = () => {
    setFeedback(null);

    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setLessonComplete(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setLessonComplete(false);
    }
  };

  return (
    <div className="lesson-container">
      <ProgressBar
        progress={lessonComplete ? 100 : ((currentQuestion + 1) / lesson.questions.length) * 100}
      />

      <h1 className="text-3xl font-bold">{lesson.title}</h1>
      <p>{lesson.description || 'No description available.'}</p>

      {lessonComplete ? (
        <div className="text-green-500 text-2xl font-bold mt-6">
          Congratulations! You have completed the lesson.
        </div>
      ) : (
        <div className="question-section my-6">
          {question.hasTimer && timeLeft !== null && (
            <Timer timeLeft={timeLeft} onTimeout={handleTimeout} />
          )}

          <p className="text-xl">{question.content}</p>

          {/* Audio Recorder Section */}
          {question.audioUrl && <AudioRecorder audioUrl={question.audioUrl} />}

          {/* Render Drag and Drop Audio for DRAG_DROP_AUDIO Question Type */}
          {question.type === 'DRAG_DROP_AUDIO' && question.options && (
            <DragDropAudio
              audioUrl={question.audioUrl!}
              words={question.options}
              correctOrder={question.correctAnswer.split(' ')}
              onSubmit={handleDropSubmit}
            />
          )}

          {/* Render Listen and Type for LISTEN_AND_TYPE Question Type */}
          {question.type === 'LISTEN_AND_TYPE' && question.audioUrl && (
            <ListenAndType
              audioUrl={question.audioUrl}
              correctAnswer={question.correctAnswer}
              language={question.language || 'arabic'}
              onSubmit={handleListenSubmit}
            />
          )}

          {/* Audio Preview Question */}
          {question.type === 'AUDIO_PREVIEW' && question.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-4">
                  <button
                    onClick={() => playAudio(question.audioUrl)}
                    className="btn btn-primary"
                  >
                    {option}
                  </button>
                </div>
              ))}
              <audio ref={audioRef} />
            </div>
          )}

          {/* True/False Question */}
          {question.type === 'TRUE_FALSE' && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleAnswer('true')}
                className={`btn ${selectedAnswer === 'true' ? 'btn-primary' : 'btn-secondary'}`}
              >
                True
              </button>
              <button
                onClick={() => handleAnswer('false')}
                className={`btn ${selectedAnswer === 'false' ? 'btn-primary' : 'btn-secondary'}`}
              >
                False
              </button>
            </div>
          )}

          {/* Multiple Choice Question */}
          {question.type === 'MULTIPLE_CHOICE' && question.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`btn ${
                    selectedAnswer === option ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Text Input Question */}
          {question.type === 'TEXT_INPUT' && (
            <div className="flex flex-col mt-4">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Type your answer here"
              />
              <button
                onClick={handleSubmitTextAnswer}
                className="btn btn-primary mt-4"
              >
                Submit
              </button>
            </div>
          )}

          {/* Render Speak and Answer for SPEAK_ANSWER Question Type */}
          {question.type === 'SPEAK_ANSWER' && (
            <SpeakAndAnswer
              correctAnswer={question.correctAnswer}
              onSubmit={handleSpeakSubmit}
            />
          )}

          {/* Render Draw Canvas for DRAW_INPUT questions */}
          {question.type === 'DRAW_INPUT' && <DrawCanvas onSubmit={handleDrawingSubmit} />}

          {feedback && (
            <p
              className={`mt-4 ${
                feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {feedback}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between mt-8">
        {currentQuestion > 0 && (
          <button onClick={handleBack} className="btn btn-secondary">
            Back
          </button>
        )}
        {!lessonComplete && (
          <button onClick={handleNext} className="btn btn-primary">
            {currentQuestion < lesson.questions.length - 1 ? 'Next' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}
