'use client';
import { useState, useRef, useEffect } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import DrawCanvas from '@/components/ui/DrawCanvas';
import DragDropAudio from '@/components/ui/DragDropAudio';
import ListenAndType from '@/components/ui/ListenAndType';
import SpeakAndAnswer from '@/components/ui/SpeakAndAnswer';
import AudioRecorder from '@/components/ui/AudioRecorder';
import Timer from '@/components/ui/Timer';


interface Word {
  id: string;
  text: string;
  type: "NOUN" | "VERB" | "PRONOUN" | "ADJECTIVE";
  audioUrl?: string | null; // ✅ Allow both `string` and `null`
}



interface Lesson {
id: string;
title: string;
language: string;
description?: string | null;
questions: Question[]; // Ensure this aligns with your schema
}

const wordColors = {
  NOUN: "text-blue-500",
  VERB: "text-red-500",
  PRONOUN: "text-green-500",
  ADJECTIVE: "text-purple-500",
};


interface Question {
content: string;
options?: string[];
words: Word[];
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
const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
const [timerRunning, setTimerRunning] = useState(true);




const question = lesson.questions[currentQuestion];




async function saveProgress(lessonId: string, progress: number) {
try {
  const res = await fetch('/api/lesson/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, progress }),
  });




  if (!res.ok) {
    console.error('Failed to save progress:', await res.text());
  }
} catch (error) {
  console.error('Error saving progress:', error);
}
}




// Adjust timer duration based on performance
useEffect(() => {
 console.log(`User ID: ${userId}`); // Log the userId to verify it's passed correctly
  if (question.hasTimer) {
   const baseTime = 10;
   const adjustment = performance.slice(-3).reduce((sum, val) => sum + val, 0);
   const newTime = baseTime + adjustment * 5;
   setTimeLeft(newTime > 10 ? newTime : 10);
   setTimerRunning(true); // Start the timer when a new question loads
 } else {
   setTimeLeft(null);
   setTimerRunning(false);
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


const playWordAudio = (audioUrl?: string) => {
  if (!audioUrl) {
    console.error("No audio URL provided.");
    return;
  }

  console.log("Attempting to play audio from:", audioUrl);

  const audio = new Audio(audioUrl);
  audio.play()
    .then(() => console.log("Audio playing..."))
    .catch((error) => console.error("Audio playback failed:", error));
};





// Handle speak-and-answer submission
const handleSpeakSubmit = (isCorrect: boolean) => {
 setFeedback(isCorrect ? 'Correct!' : 'Try again.');
 setIsAnswerCorrect(isCorrect);
 if (isCorrect) setTimerRunning(false);
};




// Handle submission for drag-and-drop audio questions
const handleDropSubmit = (isCorrect: boolean) => {
 setFeedback(isCorrect ? 'Correct!' : 'Try again.');
 setIsAnswerCorrect(isCorrect);
 if (isCorrect) setTimerRunning(false);
};




// Handle listen-and-type submission
const handleListenSubmit = (isCorrect: boolean) => {
 setFeedback(isCorrect ? 'Correct!' : 'Try again.');
 setIsAnswerCorrect(isCorrect);
 if (isCorrect) setTimerRunning(false);
};




// Handle answer selection or text input submission
const handleAnswer = (option: string) => {
 const isCorrect = option === question.correctAnswer;
 setFeedback(isCorrect ? 'Correct!' : `Incorrect! The correct answer is: ${question.correctAnswer}`);
 setSelectedAnswer(option);
 setIsAnswerCorrect(isCorrect);
 if (isCorrect) setTimerRunning(false); // Stop the timer
};








// Handle submission of canvas drawing
const handleDrawingSubmit = (dataUrl: string) => {
 console.log('Drawing submitted:', dataUrl);
 setFeedback('Drawing submitted successfully!');
 setIsAnswerCorrect(true);
 setTimerRunning(false);
};




const handleSubmitTextAnswer = () => {
 if (typedAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
   setFeedback('Correct!');
   setIsAnswerCorrect(true);
   setTimerRunning(false); // Stop the timer
 } else {
   setFeedback('Try again.');
   setIsAnswerCorrect(false);
 }
};




const handleNext = () => {
 if (!isAnswerCorrect && !lessonComplete) {
   setFeedback('Please answer the question correctly before proceeding.');
   return;
 }


 setFeedback(null);
 setSelectedAnswer(null);
 setIsAnswerCorrect(false); // Reset for the next question


 if (incorrectQuestions.length > 0) {
   setCurrentQuestion(incorrectQuestions[0]);
   setIncorrectQuestions((prev) => prev.slice(1));
 } else if (currentQuestion < lesson.questions.length - 1) {
   setCurrentQuestion(currentQuestion + 1);
 } else {
   const isLessonCompleted = incorrectQuestions.length === 0;
   setLessonComplete(isLessonCompleted);
   saveCompletion(lesson.id, isLessonCompleted);
 }
};








const saveCompletion = async (lessonId: string, completed: boolean) => {
try {
  const res = await fetch('/api/lesson/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, completed }),
  });




  if (!res.ok) {
    console.error('Failed to save completion status:', await res.text());
  }
} catch (error) {
  console.error('Error saving completion status:', error);
}
};




const savePartialProgress = () => {
  const totalQuestions = lesson.questions.length;
  const answeredCorrectly = totalQuestions - incorrectQuestions.length;
  const progress = Math.round((answeredCorrectly / totalQuestions) * 100);
   saveProgress(lesson.id, progress);
};




const handleBack = () => {
 if (currentQuestion > 0) {
   setCurrentQuestion(currentQuestion - 1);
   setFeedback(null); // Clear feedback when going back
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
       <Timer timeLeft={timeLeft} onTimeout={handleTimeout} timerRunning={timerRunning} />
       )}

        <p className="text-xl">{question.content}</p>

        <p className="text-lg mt-2">
        {question.words.length > 0 ? (
  question.words
    .map((word: Word) => (
      <span
        key={word.id}
        className={`${wordColors[word.type]} mx-1 cursor-pointer`}
        onClick={() => playWordAudio(word.audioUrl ?? undefined)}
      >
        {word.text}
      </span>
    ))
) : (
  <span className="text-gray-500">No words available.</span>
)}
</p>


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
  <button
  onClick={handleNext}
  className={`btn btn-primary ${
    !isAnswerCorrect ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  disabled={!isAnswerCorrect} // Only enabled if the answer is correct
>
  {currentQuestion < lesson.questions.length - 1 ? 'Next' : 'Finish'}
</button>
)}
    </div>
  </div>
);
}



