"use client";

import { useEffect, useState } from "react";

export default function BrowserWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isMac = /Macintosh/.test(ua);

    if (isSafari && isMac) {
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
