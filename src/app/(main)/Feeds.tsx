"use client";

import { useState } from "react";
import PunjabiFeed from "./PunjabiFeed";
import Global from "./GlobalFeed";
import UrduFeed from "./UrduFeed";
import LanguageChooser from "./LanguageChooser";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import GlobalFeed from "./GlobalFeed";
import global from "@/assets/Global.png";

const languages = [
  { name: "Global", flag: global },
  { name: "Punjabi", flag: india },
  { name: "Urdu", flag: pakistan },
];

const feedComponents: Record<string, React.ComponentType> = {
  Global: GlobalFeed,
  Punjabi: PunjabiFeed,
  Urdu: UrduFeed,
};

export default function Feeds() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const SelectedFeed = feedComponents[selectedLanguage.name] || GlobalFeed;

  return (
    <div className="w-full min-w-0 space-y-5">
      <LanguageChooser
        className="w-40"
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
      <SelectedFeed />
    </div>
  );
}