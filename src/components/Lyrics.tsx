"use client";

interface Word {
  word: {
    text: string; // ✅ Ensure word is an object with a text property
  };
  startTime: number;
  endTime: number;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
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
    english: song.englishSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
    target: song.targetSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
    transliteration: song.transliterationSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
  };

  const getHighlightedWord = (sentence?: Sentence) =>
    sentence?.words.find(
      (word) => currentTime >= word.startTime && currentTime < word.endTime
    )?.word.text || null; // ✅ Fetch text from the Word model

  return (
    <div className="w-full max-w-lg mx-auto mt-4">
      <p className="text-center font-semibold">
        {currentSentences.english?.text.split(" ").map((word, index) => (
          <span key={index} className={word === getHighlightedWord(currentSentences.english) ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "(The English Translation)"}
      </p>

      <p className="text-center text-gray-700">
  {currentSentences.target?.text
    ? currentSentences.target.text.split(" ").map((word, index) => (
        <span key={index} className={word === getHighlightedWord(currentSentences.target) ? "bg-yellow-300 px-1 rounded" : ""}>
          {word}{" "}
        </span>
      ))
    : "(The Language Lyrics)"} {/* ✅ This ensures fallback text is shown */}
</p>


      <p className="text-center text-gray-500 italic">
        {currentSentences.transliteration?.text.split(" ").map((word, index) => (
          <span key={index} className={word === getHighlightedWord(currentSentences.transliteration) ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "(The Transliteration)"}
      </p>
    </div>
  );
}
