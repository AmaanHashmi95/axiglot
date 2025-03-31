// src/components/ThemeSelector.tsx
"use client";

import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const options = [
    { label: "System default", value: "system", icon: <Monitor className="mr-2 size-4" /> },
    { label: "Light", value: "light", icon: <Sun className="mr-2 size-4" /> },
    { label: "Dark", value: "dark", icon: <Moon className="mr-2 size-4" /> },
  ];

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Theme</h3>
      <div className="flex flex-col gap-2">
        {options.map(({ label, value, icon }) => (
          <Button
            key={value}
            variant="outline"
            className="justify-start"
            onClick={() => setTheme(value)}
          >
            {icon}
            {label}
            {theme === value && <Check className="ml-auto size-4" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
