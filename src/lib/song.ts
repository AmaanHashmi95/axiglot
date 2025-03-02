export interface Word {
    word: string;
    startTime: number;
    endTime: number;
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
    audioUrl: string;
    englishSentences: Sentence[];
    targetSentences: Sentence[];
    transliterationSentences: Sentence[];
  }
  