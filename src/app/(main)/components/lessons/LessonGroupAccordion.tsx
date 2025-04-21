'use client';

import Link from 'next/link';
import Image from 'next/image';
import blueTick from '@/assets/Blue Tick.png';
import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface LessonGroupProps {
  group: {
    id: string;
    title: string;
    completed?: boolean;
    lessons: Lesson[];
  };
  courseId: string;
  gradientClass: string;
}

export default function LessonGroupAccordion({
  group,
  courseId,
  gradientClass,
}: LessonGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${gradientClass}`}>
      <div
        className="mb-5 flex cursor-pointer items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-left text-2xl font-bold">{group.title}</h2>
          {group.completed && (
            <Image src={blueTick} alt="Group Completed" width={20} height={20} />
          )}
        </div>
        <div className="text-2xl">{isOpen ? '▲' : '▼'}</div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {group.lessons.map((lesson) => (
            <Link key={lesson.id} href={`/courses/${courseId}/${lesson.id}`}>
              <div
                className={`flex w-full cursor-pointer items-center justify-between rounded-2xl p-5 shadow-sm ${
                  lesson.completed
                    ? 'border-4 border-[#00E2FF] bg-white text-black'
                    : 'bg-white text-black'
                }`}
              >
                <h3 className="text-left text-xl font-bold">{lesson.title}</h3>
                {lesson.completed && (
                  <Image
                    src={blueTick}
                    alt="Completed"
                    width={20}
                    height={20}
                    className="ml-2"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
