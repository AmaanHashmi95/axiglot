"use client";
import { useState, useRef, useEffect } from "react";
import { FaVolumeUp, FaStop, FaMicrophone } from "react-icons/fa";

interface AudioRecorderProps {
  audioUrl: string;
}

export default function AudioRecorder({ audioUrl }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const getSupportedMimeType = () => {
    const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const playQuestionAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecording(true);
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType();
      if (!mimeType) return;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const newUrl = URL.createObjectURL(audioBlob);

        if (userAudioUrl) URL.revokeObjectURL(userAudioUrl); // Clean up old blob
        setUserAudioUrl(newUrl);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      timeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording();
        }
      }, 10000);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const playRecordedAudio = () => {
    if (!userAudioUrl || !audioPlaybackRef.current) return;
    audioPlaybackRef.current.src = userAudioUrl;

    // iOS WebKit playback fix
    setTimeout(() => {
      audioPlaybackRef.current?.play().catch((err) => {
        console.error("User audio playback failed:", err);
      });
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setUserAudioUrl(null);
    };
  }, []);

  return (
    <div className="mt-6 flex justify-center gap-4">
      <audio ref={audioPlaybackRef} hidden />

      {/* Play Question Audio */}
      <button
        onClick={playQuestionAudio}
        aria-label="Play Question Audio"
        className="h-14 w-14 rounded-full bg-[#00E2FF] text-white flex items-center justify-center shadow-md"
      >
        <FaVolumeUp className="text-lg" />
      </button>

      {/* Record / Stop Button */}
      <button
        onClick={recording ? stopRecording : startRecording}
        aria-label={recording ? "Stop Recording" : "Record Yourself"}
        className="h-14 w-14 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-md"
      >
        {recording ? <FaStop className="text-lg" /> : <FaMicrophone className="text-lg" />}
      </button>

      {/* Play User Recording */}
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
  );
}
