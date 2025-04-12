// src/hooks/useAudioCache.ts
import { useRef } from "react";

const SUPPORTED_FORMATS = [".mp3", ".ogg"];

export default function useAudioCache(basePath = "/sounds") {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = (filenameWithoutExt: string) => {
    for (const ext of SUPPORTED_FORMATS) {
      const path = `${basePath}/${filenameWithoutExt}${ext}`;
      let audio = audioCache.current.get(path);

      if (!audio) {
        audio = new Audio(path);
        audio.volume = 1;
        audio.load();
        audioCache.current.set(path, audio);
      }

      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          return;
        })
        .catch((err) => {
          console.warn("Audio play failed:", path, err);
        });

      // Play only one supported format
      break;
    }
  };

  return play;
}
