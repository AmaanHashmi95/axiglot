"use client";

import { Dispatch, SetStateAction } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";
import { ChevronDown } from "lucide-react";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import global from "@/assets/Global.png";

interface Language {
  name: string;
  flag: StaticImageData;
}

const languages: Language[] = [
  { name: "Global", flag: global },
  { name: "Punjabi", flag: india },
  { name: "Urdu", flag: pakistan },
];

interface LanguageChooserProps {
  className?: string;
  selectedLanguage: Language;
  setSelectedLanguage: Dispatch<SetStateAction<Language>>;
}

export default function LanguageChooser({ className, selectedLanguage, setSelectedLanguage }: LanguageChooserProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex items-center gap-2 p-2 rounded-lg border bg-gray-900", className)}>
          <Image src={selectedLanguage.flag} alt={selectedLanguage.name} width={24} height={24} />
          <span>{selectedLanguage.name}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.name} onClick={() => setSelectedLanguage(lang)}>
            <Image src={lang.flag} alt={lang.name} width={24} height={24} />
            <span className="ml-2">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}