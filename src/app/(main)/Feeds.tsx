"use client";

import { useState } from "react";
import PunjabiFeed from "./PunjabiFeed";
import UrduFeed from "./UrduFeed";
import LanguageChooser from "./LanguageChooser";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";

const languages = [
  { name: "Punjabi", flag: india },
  { name: "Urdu", flag: pakistan },
];

export default function Feeds() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]); // Default: Punjabi

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Language Chooser */}
      <LanguageChooser className="w-40" selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
      
      {/* Conditionally Render the Correct Feed */}
      {selectedLanguage.name === "Punjabi" ? <PunjabiFeed /> : <UrduFeed />}
    </div>
  );
}