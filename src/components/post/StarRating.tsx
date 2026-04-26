"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function StarRating({ value, onChange }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Partial-fill stars (clickable for coarse integer selection) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => {
            const fill = hover > 0 ? (i < hover ? 1 : 0) : value > 0 ? Math.min(1, Math.max(0, value - i)) : 0;
            return (
              <button
                key={i}
                type="button"
                aria-label={`★${i + 1}`}
                onClick={() => onChange(i + 1)}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                className="relative w-9 h-9 transition-transform hover:scale-110 active:scale-95"
              >
                <Star className="absolute inset-0 w-9 h-9 fill-gray-200 text-gray-200" />
                {fill > 0 && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fill * 100}%` }}
                  >
                    <Star className="w-9 h-9 fill-[#FFFF00] text-[#FFFF00]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {value > 0 ? (
          <span className="text-xl font-black text-gray-800">{value.toFixed(1)}</span>
        ) : (
          <span className="text-sm text-gray-400">星をタップして選択</span>
        )}
      </div>

      {/* Fine-tune slider (0.1 step, shown after initial star click) */}
      {value > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-6">1.0</span>
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 accent-[#FFFF00]"
          />
          <span className="text-xs text-gray-400 w-6 text-right">5.0</span>
        </div>
      )}
    </div>
  );
}
