export interface Word {
  word: {
    id: string;
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

export interface VideoListItem {
  id: string;
  title: string;
  genre: string;
  streamSrc: string;
  language?: string;
  imageUrl?: string;
}

export interface Video extends VideoListItem {
  englishSentences: Sentence[];
  targetSentences: Sentence[];
  transliterationSentences: Sentence[];
}

export type VideoSubtitles = Pick<
  Video,
  "englishSentences" | "targetSentences" | "transliterationSentences"
>;

