"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function StarRating({ value, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const [inputText, setInputText] = useState("");
  const [editing, setEditing] = useState(false);

  const handleNumberInput = (raw: string) => {
    setInputText(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 1 && n <= 5) {
      onChange(Math.round(n * 10) / 10);
    }
  };

  const handleNumberBlur = () => {
    setEditing(false);
    setInputText("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Stars + number input */}
      <div className="flex items-center gap-3">
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
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                    <Star className="w-9 h-9 fill-[#FFFF00] text-[#FFFF00]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Numeric input */}
        <input
          type="number"
          min={1}
          max={5}
          step={0.1}
          value={editing ? inputText : value > 0 ? value.toFixed(1) : ""}
          placeholder="—"
          onFocus={() => { setEditing(true); setInputText(value > 0 ? value.toFixed(1) : ""); }}
          onChange={(e) => handleNumberInput(e.target.value)}
          onBlur={handleNumberBlur}
          className="w-16 text-xl font-black text-gray-800 text-center border-b-2 border-gray-300 focus:border-[#FFFF00] outline-none bg-transparent"
        />
      </div>

      {/* Fine-tune slider */}
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

      {value === 0 && (
        <p className="text-xs text-gray-400">星・スライダー・数値入力で選択（1.0〜5.0）</p>
      )}
    </div>
  );
}
