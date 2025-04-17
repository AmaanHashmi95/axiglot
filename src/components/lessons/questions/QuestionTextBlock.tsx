"use client";
import LessonBookmarkButton from "../LessonBookmarkButton";

interface Word {
  id: string;
  text: string;
  color: string;
  audioUrl?: string | null;
  transliteration?: string;
}

interface Translation {
  id: string;
  text: string;
  color: string;
}

interface Props {
  words: Word[];
  translations: Translation[];
  lessonId: string;
  questionId: string;
  activeWordId: string | null;
  lastClickedWord: string | null;
  setActiveWordId: (id: string | null) => void;
  setLastClickedWord: (id: string | null) => void;
  playWordAudio: (url?: string) => void;
}

export default function QuestionTextBlock({
  words,
  translations,
  lessonId,
  questionId,
  activeWordId,
  lastClickedWord,
  setActiveWordId,
  setLastClickedWord,
  playWordAudio,
}: Props) {
  const handleMouseEnter = (wordId: string) => {
    if (!lastClickedWord) setActiveWordId(wordId);
  };

  const handleMouseLeave = (wordId: string) => {
    if (lastClickedWord !== wordId) setActiveWordId(null);
  };

  const handleWordClick = (wordId: string, audioUrl?: string | null) => {
    if (activeWordId === wordId) return;
    setLastClickedWord(wordId);
    setActiveWordId(wordId);
    playWordAudio(audioUrl ?? undefined);
  };

  return (
    <div className="mt-2 text-lg">
      {words.length > 0 ? (
        <div>
          {words.map((word) => (
            <span
              key={word.id}
              style={{ color: word.color }}
              className="word-container relative mx-1 cursor-pointer"
              onMouseEnter={() => handleMouseEnter(word.id)}
              onMouseLeave={() => handleMouseLeave(word.id)}
              onClick={() => handleWordClick(word.id, word.audioUrl)}
            >
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
        <span className="text-gray-500"></span>
      )}

      {translations.length > 0 ? (
        <div className="mt-2 text-gray-800">
          {translations.map((translation) => (
            <div key={translation.id} className="flex items-center">
              <span style={{ color: translation.color }} className="mx-1">
                {translation.text}
              </span>
              <LessonBookmarkButton
                lessonId={lessonId}
                questionId={questionId}
                words={words}
                translations={translations}
              />
            </div>
          ))}
        </div>
      ) : (
        <span className="text-gray-500"></span>
      )}
    </div>
  );
}
