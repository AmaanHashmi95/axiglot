// src/app/(main)/components/ui/AudioRecorder.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa";

interface AudioRecorderProps {
  audioUrl: string;
}

export default function AudioRecorder({ audioUrl }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  const getMimeType = () => {
    const formats = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    return formats.find((f) => MediaRecorder.isTypeSupported(f)) || "";
  };

  const playQuestionAudio = () => {
    if (questionAudioRef.current) {
      questionAudioRef.current.currentTime = 0;
      questionAudioRef.current.play().catch(console.error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      if (!mimeType) throw new Error("No supported audio MIME type");

      chunksRef.current = [];
      setError(null);
      setRecording(true);
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          setError("Recording failed. Try again.");
          return;
        }

        const url = URL.createObjectURL(blob);
        if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
        setUserAudioUrl(url);
        if (userAudioRef.current) {
          userAudioRef.current.src = url;
        }
        cleanupStream();
      };

      recorder.start();
    } catch (err) {
      console.error("Mic access error:", err);
      setError("Microphone access denied.");
      cleanupStream();
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const playUserAudio = () => {
    if (userAudioRef.current && userAudioUrl) {
      userAudioRef.current.currentTime = 0;
      userAudioRef.current.play().catch((err) => {
        console.error("Playback error:", err);
        setError("Sorry there’s a glitch! Give it a minute and try again.");
      });
    }
  };

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupStream();
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    };
  }, [userAudioUrl]);

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <audio ref={questionAudioRef} src={audioUrl} preload="auto" hidden />
      <audio ref={userAudioRef} preload="auto" hidden />

      <div className="flex gap-4">
        <button
          onClick={playQuestionAudio}
          className="h-14 w-14 rounded-full bg-[#00E2FF] text-white flex items-center justify-center shadow-md"
          aria-label="Play Question Audio"
        >
          <FaVolumeUp />
        </button>

        <button
          onClick={recording ? stopRecording : startRecording}
          className="h-14 w-14 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-md"
          aria-label="Record"
        >
          {recording ? <FaStop /> : <FaMicrophone />}
        </button>

        <button
          onClick={playUserAudio}
          disabled={!userAudioUrl}
          className={`h-14 w-14 rounded-full ${
            userAudioUrl ? "bg-gray-500 text-white" : "bg-gray-300 text-gray-400"
          } flex items-center justify-center shadow-md`}
          aria-label="Play Your Recording"
        >
          <FaVolumeUp />
        </button>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}
