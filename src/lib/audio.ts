export interface AudioLesson {
  id: string;
  title: string;
  speaker: string;
  streamSrc: string;   // ← we never expose blobUrl/audioUrl to the client
  language?: string;
  imageUrl?: string;
}
