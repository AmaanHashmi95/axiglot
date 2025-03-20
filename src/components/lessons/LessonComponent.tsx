"use client";
import { useState, useRef, useEffect } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import DrawCanvas from "@/components/ui/DrawCanvas";
import DragDropAudio from "@/components/ui/DragDropAudio";
import ListenAndType from "@/components/ui/ListenAndType";
import SpeakAndAnswer from "@/components/ui/SpeakAndAnswer";
import AudioRecorder from "@/components/ui/AudioRecorder";
import Timer from "@/components/ui/Timer";
import LessonBookmarkButton from "./LessonBookmarkButton";




interface Word {
id: string;
text: string;
color: string; // ✅ New: Apply dynamic color from database
audioUrl?: string | null; // ✅ Allow both `string` and `null
transliteration?: string; // ✅ Include transliteration
}




interface Lesson {
id: string;
title: string;
language: string;
description?: string | null;
questions: Question[]; // Ensure this aligns with your schema
}




interface Translation {
id: string;
text: string;
color: string; // ✅ New: Apply dynamic color from database
}




interface Question {
id: string; // ✅ Ensure 'id' exists in the interface
content: string;
options?: string[];
words: Word[];
translations: Translation[]; // ✅ Add translations field
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




export default function LessonComponent({
lesson,
userId,
}: LessonComponentProps) {
const [currentQuestion, setCurrentQuestion] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
const [typedAnswer, setTypedAnswer] = useState<string>("");
const [feedback, setFeedback] = useState<string | null>(null);
const audioRef = useRef<HTMLAudioElement | null>(null);
const [timeLeft, setTimeLeft] = useState<number | null>(null);
const [performance, setPerformance] = useState<number[]>([]); // Tracks 1 for correct, 0 for incorrect
const [lessonComplete, setLessonComplete] = useState(false);
const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
const [timerRunning, setTimerRunning] = useState(true);




const question = lesson.questions[currentQuestion];




const [activeWordId, setActiveWordId] = useState<string | null>(null);
const [lastClickedWord, setLastClickedWord] = useState<string | null>(null);




const handleMouseEnter = (wordId: string) => {
  // Only show on hover if it was not clicked before
  if (!lastClickedWord) {
    setActiveWordId(wordId);
  }
};




const handleMouseLeave = (wordId: string) => {
  // Only hide if it was NOT clicked
  if (lastClickedWord !== wordId) {
    setActiveWordId(null);
  }
};




const handleWordClick = (wordId: string) => {
  if (activeWordId === wordId) {
    // If clicking the same word, do nothing (keep tooltip open)
    return;
  }




  setLastClickedWord(wordId);
  setActiveWordId(wordId);
};




// Close transliteration when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (!(event.target as HTMLElement).closest(".word-container")) {
      setActiveWordId(null);
      setLastClickedWord(null);
    }
  };




  document.addEventListener("click", handleClickOutside);
  document.addEventListener("touchstart", handleClickOutside);




  return () => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("touchstart", handleClickOutside);
  };
}, []);




async function saveProgress(lessonId: string, progress: number) {
  try {
    const res = await fetch("/api/lesson/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, progress }),
    });




    if (!res.ok) {
      console.error("Failed to save progress:", await res.text());
    }
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}




// Adjust timer duration based on performance
useEffect(() => {
  console.log(`User ID: ${userId}`); // Log the userId to verify it's passed correctly
  if (question.hasTimer) {
    const baseTime = 10;
    const adjustment = performance
      .slice(-3)
      .reduce((sum, val) => sum + val, 0);
    const newTime = baseTime + adjustment * 5;
    setTimeLeft(newTime > 10 ? newTime : 10);
    setTimerRunning(true); // Start the timer when a new question loads
  } else {
    setTimeLeft(null);
    setTimerRunning(false);
  }
}, [currentQuestion, question.hasTimer, performance, userId]);




const handleTimeout = () => {
  setFeedback("Time’s up!");
};




const playAudio = (audioUrl: string | null | undefined) => {
  if (audioUrl && audioRef.current) {
    audioRef.current.src = audioUrl;
    audioRef.current.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  } else {
    console.error("Audio URL is missing or invalid.");
  }
};




const playWordAudio = (audioUrl?: string) => {
  if (!audioUrl) {
    console.error("No audio URL provided.");
    return;
  }




  console.log("Attempting to play audio from:", audioUrl);




  const audio = new Audio(audioUrl);
  audio
    .play()
    .then(() => console.log("Audio playing..."))
    .catch((error) => console.error("Audio playback failed:", error));
};




// Handle speak-and-answer submission
const handleSpeakSubmit = (isCorrect: boolean) => {
  setFeedback(isCorrect ? "Correct!" : "Try again.");
  setIsAnswerCorrect(isCorrect);
  if (isCorrect) setTimerRunning(false);
};




// Handle submission for drag-and-drop audio questions
const handleDropSubmit = (isCorrect: boolean) => {
  setFeedback(isCorrect ? "Correct!" : "Try again.");
  setIsAnswerCorrect(isCorrect);
  if (isCorrect) setTimerRunning(false);
};




// Handle listen-and-type submission
const handleListenSubmit = (isCorrect: boolean) => {
  setFeedback(isCorrect ? "Correct!" : "Try again.");
  setIsAnswerCorrect(isCorrect);
  if (isCorrect) setTimerRunning(false);
};




// Handle answer selection or text input submission
const handleAnswer = (option: string) => {
  const isCorrect = option === question.correctAnswer;
  setFeedback(
    isCorrect
      ? "Correct!"
      : `Incorrect! The correct answer is: ${question.correctAnswer}`,
  );
  setSelectedAnswer(option);
  setIsAnswerCorrect(isCorrect);
  if (isCorrect) setTimerRunning(false); // Stop the timer
};




// Handle submission of canvas drawing
const handleDrawingSubmit = (dataUrl: string) => {
  console.log("Drawing submitted:", dataUrl);
  setFeedback("Drawing submitted successfully!");
  setIsAnswerCorrect(true);
  setTimerRunning(false);
};




const handleSubmitTextAnswer = () => {
  if (typedAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
    setFeedback("Correct!");
    setIsAnswerCorrect(true);
    setTimerRunning(false); // Stop the timer
  } else {
    setFeedback("Try again.");
    setIsAnswerCorrect(false);
  }
};




const handleNext = () => {
  if (!isAnswerCorrect && !lessonComplete) {
    setFeedback("Please answer the question correctly before proceeding.");
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
    const res = await fetch("/api/lesson/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed }),
    });




    if (!res.ok) {
      console.error("Failed to save completion status:", await res.text());
    }
  } catch (error) {
    console.error("Error saving completion status:", error);
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
      progress={
        lessonComplete
          ? 100
          : ((currentQuestion + 1) / lesson.questions.length) * 100
      }
    />




    <h1 className="text-3xl font-bold">{lesson.title}</h1>
    <p>{lesson.description || "No description available."}</p>




    {lessonComplete ? (
      <div className="mt-6 text-2xl font-bold text-green-500">
        Congratulations! You have completed the lesson.
      </div>
    ) : (
      <div className="question-section my-6">
        {question.hasTimer && timeLeft !== null && (
          <Timer
            timeLeft={timeLeft}
            onTimeout={handleTimeout}
            timerRunning={timerRunning}
          />
        )}




        <p className="text-xl">{question.content}</p>




        <div className="mt-2 text-lg">
          {/* Original sentence with colors */}
          {question.words.length > 0 ? (
            <div>
              {question.words.map((word) => (
                <span
                  key={word.id}
                  style={{ color: word.color }}
                  className="word-container relative mx-1 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(word.id)}
                  onMouseLeave={() => handleMouseLeave(word.id)}
                  onClick={() => {
                    handleWordClick(word.id);
                    playWordAudio(word.audioUrl ?? undefined); // ✅ Play audio on click
                  }}
                >
                  {/* Transliteration Popup (Shows above word) */}
                  {activeWordId === word.id && word.transliteration && (
                    <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ease-in-out">
                      {word.transliteration}
                    </span>
                  )}




                  {word.text}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">No words available.</span>
          )}




          {/* Translated sentence with colors */}
{question.translations.length > 0 ? (
 <div className="mt-2 text-gray-800">
   {question.translations.map((translation) => (
     <div key={translation.id} className="flex items-center">
       <span style={{ color: translation.color }} className="mx-1">
         {translation.text}
       </span>
       <LessonBookmarkButton
  lessonId={lesson.id}
  questionId={question.id}
  words={question.words}
  translations={question.translations}
/>
     </div>
   ))}
 </div>
) : (
 <span className="text-gray-500">No translation available.</span>
)}
        </div>




        {/* Audio Recorder Section */}
        {question.audioUrl && <AudioRecorder audioUrl={question.audioUrl} />}




        {/* Render Drag and Drop Audio for DRAG_DROP_AUDIO Question Type */}
        {question.type === "DRAG_DROP_AUDIO" && question.options && (
          <DragDropAudio
            audioUrl={question.audioUrl!}
            words={question.options}
            correctOrder={question.correctAnswer.split(" ")}
            onSubmit={handleDropSubmit}
          />
        )}




        {/* Render Listen and Type for LISTEN_AND_TYPE Question Type */}
        {question.type === "LISTEN_AND_TYPE" && question.audioUrl && (
          <ListenAndType
            audioUrl={question.audioUrl}
            correctAnswer={question.correctAnswer}
            language={question.language || "arabic"}
            onSubmit={handleListenSubmit}
          />
        )}




        {/* Audio Preview Question */}
        {question.type === "AUDIO_PREVIEW" && question.options && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
        {question.type === "TRUE_FALSE" && (
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
        )}




        {/* Multiple Choice Question */}
        {question.type === "MULTIPLE_CHOICE" && question.options && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {question.options.map((option, index) => (
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
        )}




        {/* Text Input Question */}
        {question.type === "TEXT_INPUT" && (
          <div className="mt-4 flex flex-col">
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
        {question.type === "SPEAK_ANSWER" && (
          <SpeakAndAnswer
            correctAnswer={question.correctAnswer}
            onSubmit={handleSpeakSubmit}
          />
        )}




        {/* Render Draw Canvas for DRAW_INPUT questions */}
        {question.type === "DRAW_INPUT" && (
          <DrawCanvas onSubmit={handleDrawingSubmit} />
        )}




        {feedback && (
          <p
            className={`mt-4 ${
              feedback === "Correct!" ? "text-green-500" : "text-red-500"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    )}




    <div className="mt-8 flex justify-between">
      {currentQuestion > 0 && (
        <button onClick={handleBack} className="btn btn-secondary">
          Back
        </button>
      )}
      {!lessonComplete && (
        <button
          onClick={handleNext}
          className={`btn btn-primary ${
            !isAnswerCorrect ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isAnswerCorrect} // Only enabled if the answer is correct
        >
          {currentQuestion < lesson.questions.length - 1 ? "Next" : "Finish"}
        </button>
      )}
    </div>
  </div>
);
}






