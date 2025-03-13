export interface Word {
  word: { text: string };
  startTime: number;
  endTime: number;
  order: number;
}

export interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string; // ✅ Use direct audio URL from Vercel Storage
  language?: string; // ✅ Add language field
  imageUrl?: string; // ✅ New field to store the image URL
  englishSentences: Sentence[];
  targetSentences: Sentence[];
  transliterationSentences: Sentence[];
}
