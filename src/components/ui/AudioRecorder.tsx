import { useState, useRef } from 'react';

interface AudioRecorderProps {
  audioUrl: string; // URL to play the question audio
}

export default function AudioRecorder({ audioUrl }: AudioRecorderProps) {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Play Question Audio
  const playQuestionAudio = () => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Start Recording
  const startRecording = async () => {
    setRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      setUserAudioUrl(audioUrl);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  // Stop Recording
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  // Play Recorded Audio
  const playRecordedAudio = () => {
    if (userAudioUrl) {
      const audio = new Audio(userAudioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={playQuestionAudio}
        className="btn btn-primary"
      >
        ▶️ Play Question Audio
      </button>

      <div className="flex gap-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`btn ${recording ? 'btn-danger' : 'btn-secondary'}`}
        >
          🎙️ {recording ? 'Stop Recording' : 'Record Yourself'}
        </button>

        {userAudioUrl && (
          <button
            onClick={playRecordedAudio}
            className="btn btn-success"
          >
            🔊 Play Your Recording
          </button>
        )}
      </div>
    </div>
  );
}
