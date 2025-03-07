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
  
  export interface Video {
    id: string;
    title: string;
    genre: string;
    videoUrl: string; // ✅ Use direct audio URL from Vercel Storage
    language?: string; // ✅ Add language field
    imageUrl?:  string;   // ✅ New field to store the image URL
    englishSentences: Sentence[];
    targetSentences: Sentence[];
    transliterationSentences: Sentence[];
  }
  