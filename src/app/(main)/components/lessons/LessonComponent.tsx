"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import ProgressBar from "@/app/(main)/components/lessons/ProgressBar";
import DrawCanvas from "@/app/(main)/components/lessons/DrawCanvas";
import DragDropAudio from "@/app/(main)/components/lessons/DragDropAudio";
import ListenAndType from "@/app/(main)/components/lessons/ListenAndType";
import AudioRecorder from "@/app/(main)/components/ui/AudioRecorder";
import Timer from "@/app/(main)/components/lessons/Timer";
import useAudioCache from "@/hooks/useAudioCache";
import AudioPreviewQuestion from "./questions/AudioPreviewQuestion";
import TrueFalseQuestion from "./questions/TrueFalseQuestion";
import MultipleChoiceQuestion from "./questions/MultipleChoiceQuestion";
import QuestionTextBlock from "./questions/QuestionTextBlock";
import Image from "next/image";
import confetti from "canvas-confetti";

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

export default function LessonComponent({ lesson, userId }: LessonComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number[]>([]);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const playSound = useAudioCache();

  const question = lesson.questions[currentQuestion];
  const isSkippable = ["AUDIO_PREVIEW", "DRAW_INPUT"].includes(question.type);

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [lastClickedWord, setLastClickedWord] = useState<string | null>(null);

  useEffect(() => {
    const preloadSounds = ["correct.mp3", "incorrect.mp3", "complete.mp3"];
    preloadSounds.forEach((file) => {
      const audio = new Audio(`/sounds/${file}`);
      audio.load();
    });
  }, []);

  // --- RTL helpers ---
  const isRTLLanguage = (lang?: string | null) => {
    const l = (lang || '').toLowerCase();
    return [
      'arabic','ar','farsi','fa','persian','ur','urdu','he','hebrew','ps','pashto','ku','kurdish'
    ].includes(l);
  };

  const dragDropIsRTL = useMemo(() => {
    if (isRTLLanguage(question.language)) return true;
    // Auto-detect from glyphs as fallback
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      `${question.correctAnswer} ${question.options?.join(' ') ?? ''}`
    );
  }, [question.language, question.correctAnswer, question.options]);

  // Adjust timer duration based on performance
  useEffect(() => {
    if (question.hasTimer) {
      const baseTime = 10;
      const adjustment = performance.slice(-3).reduce((sum, val) => sum + val, 0);
      const newTime = baseTime + adjustment * 5;
      setTimeLeft(newTime > 10 ? newTime : 10);
      setTimerRunning(true);
    } else {
      setTimeLeft(null);
      setTimerRunning(false);
    }
  }, [currentQuestion, question.hasTimer, performance, userId]);

  const handleTimeout = () => setFeedback("Time’s up!");

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
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => console.error("Audio playback failed:", error));
  };

  const handleSpeakSubmit = (isCorrect: boolean) => {
    setFeedback(isCorrect ? "Correct!" : "Try again.");
    playSound(isCorrect ? "correct" : "incorrect");
    setIsAnswerCorrect(isCorrect);
    if (isCorrect) setTimerRunning(false);
  };

  const handleDropSubmit = (isCorrect: boolean) => {
    setFeedback(isCorrect ? "Correct!" : "Try again.");
    playSound(isCorrect ? "correct" : "incorrect");
    setIsAnswerCorrect(isCorrect);
    if (isCorrect) setTimerRunning(false);
  };

  const handleListenSubmit = (isCorrect: boolean) => {
    setFeedback(isCorrect ? "Correct!" : "Try again.");
    playSound(isCorrect ? "correct" : "incorrect");
    setIsAnswerCorrect(isCorrect);
    if (isCorrect) setTimerRunning(false);
  };

  const handleAnswer = (option: string) => {
    const isCorrect = option === question.correctAnswer;
    setFeedback(isCorrect ? "Correct!" : `Incorrect! The correct answer is: ${question.correctAnswer}`);
    playSound(isCorrect ? "correct" : "incorrect");
    setSelectedAnswer(option);
    setIsAnswerCorrect(isCorrect);
    if (isCorrect) setTimerRunning(false);
  };

  const handleDrawingSubmit = (dataUrl: string) => {
    console.log("Drawing submitted:", dataUrl);
    setFeedback("Drawing submitted successfully!");
    setIsAnswerCorrect(true);
    setTimerRunning(false);
  };

  const handleSubmitTextAnswer = () => {
    if (typedAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
      setFeedback("Correct!");
      playSound("correct");
      setIsAnswerCorrect(true);
      setTimerRunning(false);
    } else {
      setFeedback("Try again.");
      playSound("incorrect");
      setIsAnswerCorrect(false);
    }
  };

  const handleNext = () => {
    if (!isAnswerCorrect && !isSkippable && !lessonComplete) {
      setFeedback("Please answer the question correctly before proceeding.");
      return;
    }

    setFeedback(null);
    setSelectedAnswer(null);
    setIsAnswerCorrect(false);

    if (incorrectQuestions.length > 0) {
      setCurrentQuestion(incorrectQuestions[0]);
      setIncorrectQuestions((prev) => prev.slice(1));
    } else if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const isLessonCompleted = incorrectQuestions.length === 0;
      setLessonComplete(isLessonCompleted);
      if (isLessonCompleted) playSound("complete");
      saveCompletion(lesson.id, isLessonCompleted);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  };

  async function saveCompletion(lessonId: string, completed: boolean) {
    try {
      const res = await fetch("/api/lesson/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed }),
      });
      if (!res.ok) console.error("Failed to save completion status:", await res.text());
    } catch (error) {
      console.error("Error saving completion status:", error);
    }
  }

  async function saveProgress(lessonId: string, progress: number) {
    try {
      const res = await fetch("/api/lesson/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, progress }),
      });
      if (!res.ok) console.error("Failed to save progress:", await res.text());
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }

  const savePartialProgress = () => {
    const totalQuestions = lesson.questions.length;
    const answeredCorrectly = totalQuestions - incorrectQuestions.length;
    const progress = Math.round((answeredCorrectly / totalQuestions) * 100);
    saveProgress(lesson.id, progress);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback(null);
      setLessonComplete(false);
    }
  };

  return (
    <div className="lesson-container">
      <ProgressBar
        progress={lessonComplete ? 100 : ((currentQuestion + 1) / lesson.questions.length) * 100}
      />

      {lessonComplete ? (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-lg bg-green-600 px-6 py-4 text-center text-2xl font-bold text-white">
          Congratulations! You have completed the lesson.
        </div>
      ) : (
        <div className="question-section my-6 flex justify-center">
          <div className="w-full max-w-3xl text-center">
            <p className="text-xl font-semibold sm:text-2xl md:text-3xl">
              {question.content}{" "}
              {question.hasTimer && timeLeft !== null && (
                <Timer timeLeft={timeLeft} onTimeout={handleTimeout} timerRunning={timerRunning} />
              )}
            </p>

            <QuestionTextBlock
              words={question.words}
              translations={question.translations}
              lessonId={lesson.id}
              questionId={question.id}
              activeWordId={activeWordId}
              lastClickedWord={lastClickedWord}
              setActiveWordId={setActiveWordId}
              setLastClickedWord={setLastClickedWord}
              playWordAudio={playWordAudio}
            />

            {feedback && (
              <div className="mt-6 flex justify-center">
                {feedback === "Correct!" ? (
                  <Image src="/icons/Correct.png" alt="Correct" width={412} height={68} className="h-68 w-412 sm:h-68 sm:w-412" />
                ) : (
                  <Image src="/icons/TryAgain.png" alt="Incorrect" width={412} height={68} className="h-34 w-206 sm:h-34 sm:w-206" />
                )}
              </div>
            )}

            {/* DRAG_DROP_AUDIO */}
            {question.type === "DRAG_DROP_AUDIO" && question.options && (
              <DragDropAudio
                audioUrl={question.audioUrl!}
                words={question.options}
                // Why: robust splitting for RTL (handles non-breaking spaces)
                correctOrder={question.correctAnswer.replace(/\u00A0|\u202F/g, ' ').trim().split(/\s+/)}
                onSubmit={handleDropSubmit}
                isRTL={dragDropIsRTL}
              />
            )}

            {/* LISTEN_AND_TYPE */}
            {question.type === "LISTEN_AND_TYPE" && question.audioUrl && (
              <ListenAndType
                audioUrl={question.audioUrl}
                correctAnswer={question.correctAnswer}
                language={question.language || "arabic"}
                onSubmit={handleListenSubmit}
              />
            )}

            {/* AUDIO_PREVIEW */}
            {question.type === "AUDIO_PREVIEW" && question.options && (
              <AudioPreviewQuestion options={question.options} audioUrl={question.audioUrl} playAudio={playAudio} />
            )}

            {/* TRUE_FALSE */}
            {question.type === "TRUE_FALSE" && (
              <TrueFalseQuestion selectedAnswer={selectedAnswer} handleAnswer={handleAnswer} />
            )}

            {/* MULTIPLE_CHOICE */}
            {question.type === "MULTIPLE_CHOICE" && question.options && (
              <MultipleChoiceQuestion
                options={question.options}
                selectedAnswer={selectedAnswer}
                correctAnswer={question.correctAnswer}
                handleAnswer={handleAnswer}
              />
            )}

            {/* DRAW_INPUT */}
            {question.type === "DRAW_INPUT" && (
              <DrawCanvas key={question.id} onSubmit={handleDrawingSubmit} />
            )}

            {/* Audio Recorder */}
            {question.audioUrl && (
              <AudioRecorder key={`audio-${question.id}`} audioUrl={question.audioUrl} />
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex w-full items-center justify-between">
        {!lessonComplete && (
          <div>
            {currentQuestion > 0 && (
              <button onClick={handleBack} className="rounded-md bg-gray-500 px-5 py-2 text-white transition hover:bg-gray-600">
                Back
              </button>
            )}
          </div>
        )}

        <div className="ml-auto">
          {!lessonComplete && (
            <button
              onClick={handleNext}
              className={`rounded-md bg-gradient-to-r from-[#ff8a00] to-[#ef2626] px-5 py-2 text-white transition ${
                !isAnswerCorrect && !isSkippable ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={!isAnswerCorrect && !isSkippable}
            >
              {currentQuestion < lesson.questions.length - 1 ? "Next" : "Finish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
