"use client";

import { useState } from "react";
import PunjabiFeed from "./PunjabiFeed";
import Global from "./GlobalFeed";
import UrduFeed from "./UrduFeed";
import LanguageChooser from "./LanguageChooser";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import kenya from "@/assets/kenya-flag.png";
import iran from "@/assets/iran-flag.webp";
import russia from "@/assets/russia-flag.png";
import brazil from "@/assets/brazil-flag.png";
import GlobalFeed from "./GlobalFeed";
import SwahiliFeed from "./SwahiliFeed";
import FarsiFeed from "./FarsiFeed";
import RussianFeed from "./RussianFeed";
import PortugueseFeed from "./PortugueseFeed";
import global from "@/assets/Global.png";

const languages = [
  { name: "Global", flag: global },
  { name: "Punjabi", flag: india },
  { name: "Urdu", flag: pakistan },
  { name: "Swahili", flag: kenya },
  { name: "Farsi", flag: iran },
  { name: "Russian", flag: russia },
  { name: "Portuguese", flag: brazil },
];

const feedComponents: Record<string, React.ComponentType> = {
  Global: GlobalFeed,
  Punjabi: PunjabiFeed,
  Urdu: UrduFeed,
  Swahili: SwahiliFeed,
  Farsi: FarsiFeed,
  Russian: RussianFeed,
  Portuguese: PortugueseFeed,
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