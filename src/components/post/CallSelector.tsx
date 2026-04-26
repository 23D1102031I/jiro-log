"use client";

export const CALL_OPTIONS = ["抜き", "少なめ", "標準", "マシ", "マシマシ"] as const;
export type CallOption = (typeof CALL_OPTIONS)[number];

interface CallConfig {
  key: string;
  label: string;
  emoji: string;
  value: CallOption;
  onChange: (v: CallOption) => void;
}

export function CallSelector({ calls }: { calls: CallConfig[] }) {
  return (
    <div className="space-y-4">
      {calls.map(({ key, label, emoji, value, onChange }) => (
        <div key={key}>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
            <span>{emoji}</span>
            <span>{label}</span>
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {CALL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  value === opt
                    ? "bg-[#FFFF00] text-black border-black scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
