"use client";

import { useEffect, useState } from "react";

export default function BrowserWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isMac = /MacIntel/.test(platform); // Includes iPads in desktop mode
    const isTouch = "ontouchend" in document; // True for iPads, not Macs

    // Show only if it's real macOS (not iPad pretending to be Mac)
    if (isSafari && isMac && !isTouch) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="w-full bg-gray-700 px-4 py-2 text-sm text-gray-400 shadow rounded-lg">
      Safari on macOS may block videos or audio from loading. We recommend using Chrome or Firefox for the best experience.
    </div>
  );
}
