"use client";

interface Word {
  word?: { text: string }; // ✅ Ensure word object exists
  startTime: number;
  endTime: number;
  order: number;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words?: Word[]; // ✅ Ensure words can be undefined
}

interface LyricsProps {
  song: {
    englishSentences: Sentence[];
    targetSentences: Sentence[];
    transliterationSentences: Sentence[];
  };
  currentTime: number;
}

export default function Lyrics({ song, currentTime }: LyricsProps) {
  const currentSentences = {
    english: song.englishSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ),
    target: song.targetSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ),
    transliteration: song.transliterationSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ),
  };

  const getHighlightedWord = (sentence?: Sentence) =>
    sentence?.words?.find(
      (word) => currentTime >= word.startTime && currentTime < word.endTime
    )?.word?.text || null; // ✅ Ensure fallback to `null`

  return (
    <div className="w-full max-w-lg mx-auto mt-4">
      {/* ✅ English Translation */}
      <p className="text-center font-semibold">
        {currentSentences.english
          ? currentSentences.english.text.split(" ").map((word, index) => {
              const highlightedWord = getHighlightedWord(currentSentences.english);
              return (
                <span
                  key={index}
                  className={word === highlightedWord ? "bg-yellow-300 px-1 rounded" : ""}
                >
                  {word}{" "}
                </span>
              );
            })
          : "(The English Translation)"}
      </p>

      {/* ✅ Target Language */}
      <p className="text-center text-gray-700">
        {currentSentences.target
          ? currentSentences.target.text.split(" ").map((word, index) => {
              const highlightedWord = getHighlightedWord(currentSentences.target);
              return (
                <span
                  key={index}
                  className={word === highlightedWord ? "bg-yellow-300 px-1 rounded" : ""}
                >
                  {word}{" "}
                </span>
              );
            })
          : "(The Language Lyrics)"}
      </p>

      {/* ✅ Transliteration */}
      <p className="text-center text-gray-500 italic">
        {currentSentences.transliteration
          ? currentSentences.transliteration.text.split(" ").map((word, index) => {
              const highlightedWord = getHighlightedWord(currentSentences.transliteration);
              return (
                <span
                  key={index}
                  className={word === highlightedWord ? "bg-yellow-300 px-1 rounded" : ""}
                >
                  {word}{" "}
                </span>
              );
            })
          : "(The Transliteration)"}
      </p>
    </div>
  );
}
