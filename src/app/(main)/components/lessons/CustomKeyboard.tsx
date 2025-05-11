import { useState } from 'react';

interface CustomKeyboardProps {
  language: string;
  onKeyPress: (key: string) => void;
}

const layouts: Record<string, string[]> = {
  arabic: ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'],
  russian: ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'],
  farsi: ['ا','ب','پ','ت','ث','ج','چ','ح','خ','د','ذ','ر','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی'],
  punjabi: ['ਓ','ਅ','ੲ','ਸ','ਹ','ਕ','ਖ','ਗ','ਘ','ਙ','ਚ','ਛ','ਜ','ਝ','ਞ','ਟ','ਠ','ਡ','ਢ','ਣ','ਤ','ਥ','ਦ','ਧ','ਨ','ਪ','ਫ','ਬ','ਭ','ਮ','ਯ','ਰ','ਲ','ਵ','ੜ','ਸ਼','ਖ਼','ਗ਼','ਜ਼','ਫ਼','ਲ਼'],
};


export default function CustomKeyboard({
  language,
  onKeyPress,
}: CustomKeyboardProps) {
  const layout = layouts[language] || layouts['arabic']; // Default to Arabic if language not found

  return (
    <div className="keyboard-container grid grid-cols-7 gap-2 p-4 bg-gray-500 rounded-lg">
      {layout.map((char, index) => (
        <button
          key={index}
          onClick={() => onKeyPress(char)}
          className="px-4 py-2 bg-white border rounded shadow text-black hover:bg-gray-300"
        >
          {char}
        </button>
      ))}
    </div>
  );
}
