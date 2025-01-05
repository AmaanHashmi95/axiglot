import * as React from "react";

export interface ProgressProps {
  value?: number;
  max?: number;
}

export function Progress({ value = 0, max = 100 }: ProgressProps) {
  const percentage = (value / max) * 100;
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded">
      <div
        className="absolute top-0 left-0 h-2 bg-[linear-gradient(to_right,_#ff8a00,_#ef2626)] rounded"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}