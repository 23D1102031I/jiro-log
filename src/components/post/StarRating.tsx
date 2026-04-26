"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function StarRating({ value, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`★${n}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-9 h-9 transition-colors ${
              n <= display ? "fill-[#FFFF00] text-[#FFFF00]" : "fill-none text-gray-300"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1 text-lg font-black text-gray-800">{value}.0</span>
      )}
    </div>
  );
}
