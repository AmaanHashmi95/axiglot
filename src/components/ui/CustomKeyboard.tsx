import { useState } from 'react';

interface CustomKeyboardProps {
  language: string;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

const layouts: Record<string, string[]> = {
  arabic: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش'],
  russian: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М'],
  farsi: ['ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز'],
  punjabi: ['ਓ', 'ਅ', 'ੲ', 'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਚ', 'ਛ', 'ਜ', 'ਝ'],
};

export default function CustomKeyboard({
  language,
  onKeyPress,
  onBackspace
}: CustomKeyboardProps) {
  const layout = layouts[language] || layouts['arabic']; // Default to Arabic if language not found

  return (
    <div className="keyboard-container grid grid-cols-7 gap-2 p-4 bg-gray-200 rounded-lg">
      {layout.map((char, index) => (
        <button
          key={index}
          onClick={() => onKeyPress(char)}
          className="px-4 py-2 bg-white border rounded shadow hover:bg-gray-300"
        >
          {char}
        </button>
      ))}
      <button
        onClick={onBackspace}
        className="col-span-2 px-4 py-2 bg-red-400 text-white rounded shadow hover:bg-red-500"
      >
        ⌫ Backspace
      </button>
    </div>
  );
}
