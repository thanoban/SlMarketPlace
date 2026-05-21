"use client";

import { cn } from "@/lib/utils";

interface InterestPickerProps {
  interests: { _id: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function InterestPicker({ interests, selected, onChange }: InterestPickerProps) {
  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((interest) => {
        const isSelected = selected.includes(interest.name);
        return (
          <button
            key={interest._id}
            type="button"
            onClick={() => toggle(interest.name)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
            )}
          >
            {interest.name}
          </button>
        );
      })}
    </div>
  );
}
