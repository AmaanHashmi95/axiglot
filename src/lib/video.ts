export interface Word {
  word: {
    id: string; // ✅ Required by SubtitleBookmarkButton.tsx and Subtitles.tsx
    text: string;
    color?: string;
    transliteration?: string;
    audioUrl?: string;
  };
  startTime: number;
  endTime: number;
  order: number;
}

export interface Sentence {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
}

export interface Video {
  id: string;
  title: string;
  genre: string;
  videoUrl: string;
  language?: string;
  imageUrl?: string;
  englishSentences: Sentence[];
  targetSentences: Sentence[];
  transliterationSentences: Sentence[];
}
