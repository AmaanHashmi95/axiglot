'use client';

import { useState } from 'react';
import Image, { StaticImageData } from 'next/image';

interface Props {
  title: string;
  flagSrc: StaticImageData;
  flagAlt: string;
  children: React.ReactNode;
}

export default function LanguageAccordion({ title, flagSrc, flagAlt, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div
        className="flex items-center justify-between cursor-pointer mb-5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <h1 className="text-left text-2xl font-bold">{title}</h1>
          <Image src={flagSrc} alt={flagAlt} width={30} height={30} />
        </div>
        <div className="text-2xl">{isOpen ? '▲' : '▼'}</div>
      </div>

      {isOpen && children}
    </div>
  );
}
