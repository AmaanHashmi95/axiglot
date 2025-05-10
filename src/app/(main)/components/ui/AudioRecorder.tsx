"use client";
import { useState, useRef, useEffect } from "react";
import { FaVolumeUp, FaStop, FaMicrophone } from "react-icons/fa";

interface AudioRecorderProps {
  audioUrl: string;
}

export default function AudioRecorder({ audioUrl }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

  const getSupportedMimeType = () => {
    const types = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const playQuestionAudio = () => {
    if (!questionAudioRef.current) return;
    questionAudioRef.current.currentTime = 0;
    questionAudioRef.current.play().catch(console.error);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecording(true);
      setError(null);
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType();
      if (!mimeType) return;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
        const url = URL.createObjectURL(blob);
        setUserAudioUrl(url);

        if (recordedAudioRef.current) {
          recordedAudioRef.current.src = url;
          recordedAudioRef.current.load();
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      timeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === "recording") stopRecording();
      }, 10000);
    } catch (err) {
      console.error("Mic access error:", err);
      setError("Microphone access error.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const playRecordedAudio = () => {
    if (!recordedAudioRef.current || !userAudioUrl) return;
    recordedAudioRef.current.currentTime = 0;
    recordedAudioRef.current.play().catch((err) => {
      console.error("Playback error:", err);
      setError("Playback failed.");
    });
  };

  useEffect(() => {
    return () => {
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [userAudioUrl]);

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <audio ref={questionAudioRef} src={audioUrl} hidden preload="auto" />
      <audio ref={recordedAudioRef} hidden preload="auto" />

      <div className="flex gap-4">
        <button
          onClick={playQuestionAudio}
          aria-label="Play Question Audio"
          className="h-14 w-14 rounded-full bg-[#00E2FF] text-white flex items-center justify-center shadow-md"
        >
          <FaVolumeUp className="text-lg" />
        </button>

        <button
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? "Stop Recording" : "Record Yourself"}
          className="h-14 w-14 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-md"
        >
          {recording ? <FaStop className="text-lg" /> : <FaMicrophone className="text-lg" />}
        </button>

        <button
          onClick={playRecordedAudio}
          disabled={!userAudioUrl}
          aria-label="Play Your Recording"
          className={`h-14 w-14 rounded-full ${
            userAudioUrl ? "bg-gray-500 text-white" : "bg-gray-300 text-gray-400"
          } flex items-center justify-center shadow-md`}
        >
          <FaVolumeUp className="text-lg" />
        </button>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}
