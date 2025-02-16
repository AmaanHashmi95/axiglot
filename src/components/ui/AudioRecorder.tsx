import { useState, useRef } from "react";

interface AudioRecorderProps {
  audioUrl: string; // The question's provided audio URL
}

export default function AudioRecorder({ audioUrl }: AudioRecorderProps) {
  const [recording, setRecording] = useState<boolean>(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Detect the best format for the browser
  const getSupportedMimeType = () => {
    const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  // ✅ Play the provided question audio
  const playQuestionAudio = () => {
    if (!audioUrl) {
      console.error("No question audio URL provided.");
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play()
      .then(() => console.log("🎵 Playing question audio."))
      .catch((err) => console.error("❌ Error playing question audio:", err));
  };

  // ✅ Start recording user audio
  const startRecording = async () => {
    try {
      console.log("🎤 Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log("✅ Microphone access granted. Starting recording...");
      setRecording(true);
      audioChunksRef.current = []; // Reset previous recordings

      // Use the best supported MIME type
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        console.error("❌ No supported MIME type found!");
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("🎙️ Audio chunk received.");
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("⏹️ Recording stopped. Processing audio...");
        if (audioChunksRef.current.length === 0) {
          console.error("❌ No audio data recorded.");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const newUserAudioUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrl(newUserAudioUrl);
        console.log("✅ Audio recorded and available at:", newUserAudioUrl);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
    }
  };

  // ✅ Stop recording and save audio
  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      console.warn("⚠️ No active recording found.");
      return;
    }

    console.log("⏹️ Stopping recording...");
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // ✅ Play the recorded audio
  const playRecordedAudio = () => {
    if (!userAudioUrl) {
      console.warn("⚠️ No recorded audio available.");
      return;
    }

    console.log("🔊 Playing recorded audio from URL:", userAudioUrl);
    const audio = new Audio(userAudioUrl);

    audio.play()
      .then(() => console.log("🎵 Playing recorded audio."))
      .catch((err) => console.error("❌ Error playing recorded audio:", err));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Play provided question audio */}
      <button onClick={playQuestionAudio} className="btn btn-primary">
        ▶️ Play Question Audio
      </button>

      <div className="flex gap-4">
        {/* Start/Stop Recording */}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`btn ${recording ? "btn-danger" : "btn-secondary"}`}
        >
          🎙️ {recording ? "Stop Recording" : "Record Yourself"}
        </button>

        {/* Play User Recording */}
        {userAudioUrl && (
          <button onClick={playRecordedAudio} className="btn btn-success">
            🔊 Play Your Recording
          </button>
        )}
      </div>
    </div>
  );
}
