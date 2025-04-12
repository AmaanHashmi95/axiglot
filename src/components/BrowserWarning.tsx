"use client";

import { useEffect, useState } from "react";

export default function BrowserWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isMac = /Macintosh/.test(ua);
    const isiOS = /iPhone|iPad|iPod/.test(ua);

    // Show only on Safari desktop (macOS), not iOS/iPadOS
    if (isSafari && isMac && !isiOS) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="w-full bg-yellow-200 px-4 py-2 text-sm text-yellow-900 shadow">
      ⚠️ Safari on macOS may block videos or audio from loading. We recommend using Chrome or Firefox for the best experience.
    </div>
  );
}
