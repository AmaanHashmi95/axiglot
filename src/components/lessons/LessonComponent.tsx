'use client';
import { useState, useRef } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import DrawCanvas from '@/components/ui/DrawCanvas';

interface Lesson {
    title: string;
    description?: string | null;
    questions: Question[];
  }
  
  interface Question {
    content: string;
    options?: string[];
    audioUrl?: string | null;
    correctAnswer: string;
    type: string;
  }
  
  export default function LessonComponent({ lesson }: { lesson: Lesson }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [typedAnswer, setTypedAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
  
    const question = lesson.questions[currentQuestion];

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
  
    // Handle answer selection or text input submission
    const handleAnswer = (option: string) => {
      setSelectedAnswer(option);
      setFeedback(option === question.correctAnswer ? 'Correct!' : 'Try again.');
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
      setSelectedAnswer(null);
      setTypedAnswer('');
      setFeedback(null);
      if (currentQuestion < lesson.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    };
  
    const handleBack = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      }
    };
  
    return (
      <div className="lesson-container">
        <ProgressBar progress={(currentQuestion / lesson.questions.length) * 100} />
  
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p>{lesson.description || 'No description available.'}</p>
  
        <div className="question-section my-6">
          <p className="text-xl">{question.content}</p>

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
        
          {/* Render Draw Canvas for DRAW_INPUT questions */}
        {question.type === 'DRAW_INPUT' && (
          <DrawCanvas onSubmit={handleDrawingSubmit} />
        )}

          {feedback && (
            <p className={`mt-4 ${feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
              {feedback}
            </p>
          )}
        </div>
  
        <div className="flex justify-between mt-8">
          {currentQuestion > 0 && (
            <button onClick={handleBack} className="btn btn-secondary">
              Back
            </button>
          )}
          <button onClick={handleNext} className="btn btn-primary">
            Next
          </button>
        </div>
      </div>
    );
  }