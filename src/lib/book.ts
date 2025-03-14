export interface BookWord {
  id: string; // ✅ Fix - Include word ID
  word: { text: string };
  order: number;
  color?: string;
  translation?: string; // ✅ Fix - Include translation
  transliteration?: string; // ✅ Fix - Include transliteration
  translationOrder?: number; // ✅ Include translation order
  transliterationOrder?: number; // ✅ Include transliteration order
  }
  
  export interface BookSentence {
    text: string;
    translation: string;
    transliteration: string;
    words: BookWord[];
  }
  
  export interface BookPage {
    order: number;
    bookSentences: BookSentence[];
  }
  
  export interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    language?: string;
    imageUrl?: string;
    bookPages: BookPage[];
  }