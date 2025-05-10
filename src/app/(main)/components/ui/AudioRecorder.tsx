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
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const log = (msg: string) => {
    console.log(msg);
    setLogMessages((prev) => [...prev.slice(-4), msg]);
  };

  const getSupportedMimeType = () => {
    const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const playQuestionAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => log("❌ Question audio play failed: " + err));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecording(true);
      setError(null);
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        log("❌ No supported MIME type");
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        log(`📦 audioBlob.size = ${audioBlob.size}`);

        if (audioBlob.size === 0) {
          setError("Recording failed — please try again.");
          log("⚠️ Empty blob - likely failure in Safari.");
          return;
        }

        const newUrl = URL.createObjectURL(audioBlob);
        if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
        setUserAudioUrl(newUrl);
        log("✅ New blob URL set: " + newUrl);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      timeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording();
        }
      }, 10000);
    } catch (err) {
      log("❌ Mic access error: " + err);
      setError("Microphone access error.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    log("⏹️ Stopped recording");
  };

  const playRecordedAudio = () => {
    if (!userAudioUrl || !audioPlaybackRef.current) {
      log("❌ No user audio to play");
      return;
    }

    audioPlaybackRef.current.src = userAudioUrl;
    log("▶️ Playing recording: " + userAudioUrl);

    setTimeout(() => {
      audioPlaybackRef.current
        ?.play()
        .then(() => log("🎧 Playback started"))
        .catch((err) => {
          log("❌ Playback error: " + err);
          setError("Unable to play your recording.");
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
    <div className="mt-6 flex flex-col items-center gap-3">
      <audio ref={audioPlaybackRef} hidden />

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

      {error && (
        <div className="text-sm text-red-500 mt-1 text-center max-w-xs">
          {error}
        </div>
      )}

      <div className="mt-2 w-full max-w-md rounded bg-gray-100 p-2 text-xs font-mono text-left text-gray-700 shadow-inner whitespace-pre-wrap break-all">
        <strong>Debug Log:</strong>
        <div className="mt-1">
          {logMessages.map((line, i) => (
            <div key={i}>• {line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
