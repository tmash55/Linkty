import React from "react";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  id: string;
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ id, color, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        id={id}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 p-0 border-none"
      />
      <Input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-grow"
        placeholder="#000000"
      />
    </div>
  );
}
