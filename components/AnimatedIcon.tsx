import React from "react";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
}

export function AnimatedIcon({
  icon: Icon,
  className = "",
}: AnimatedIconProps) {
  return (
    <div className="group relative">
      <Icon
        className={`transition-all duration-300 ease-in-out ${className}`}
      />
      <Icon
        className={`absolute top-0 left-0 opacity-0 scale-125 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100 ${className}`}
      />
    </div>
  );
}
