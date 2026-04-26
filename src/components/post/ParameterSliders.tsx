"use client";

export const PARAM_DEFS = [
  { key: "thickness_score", label: "麺の太さ", minLabel: "細め", maxLabel: "極太" },
  { key: "dero_score", label: "麺のデロさ", minLabel: "バキ麺", maxLabel: "デロデロ" },
  { key: "vegetable_score", label: "野菜量", minLabel: "少量", maxLabel: "山盛り" },
  { key: "noodle_score", label: "麺量", minLabel: "少ない", maxLabel: "大盛り" },
  { key: "pork_score", label: "神豚度", minLabel: "パサ豚", maxLabel: "神豚" },
  { key: "emulsification_score", label: "乳化度", minLabel: "非乳化", maxLabel: "ド乳化" },
] as const;

export type ParamKey = (typeof PARAM_DEFS)[number]["key"];
export type ParamValues = Record<ParamKey, number>;

export const DEFAULT_PARAMS: ParamValues = {
  thickness_score: 3,
  dero_score: 3,
  vegetable_score: 3,
  noodle_score: 3,
  pork_score: 3,
  emulsification_score: 3,
};

interface Props {
  values: ParamValues;
  onChange: (key: ParamKey, value: number) => void;
}

const STEP_ICONS = ["①", "②", "③", "④", "⑤", "⑥"] as const;

export function ParameterSliders({ values, onChange }: Props) {
  return (
    <div className="space-y-6">
      {PARAM_DEFS.map(({ key, label, minLabel, maxLabel }, idx) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-400">{STEP_ICONS[idx]}</span>
              <label className="text-sm font-bold text-gray-800">{label}</label>
            </div>
            <span className="text-sm font-black text-black bg-[#FFFF00] w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
              {values[key]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14 text-right flex-shrink-0">
              1 ({minLabel})
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={values[key]}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className="flex-1 h-2 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FFFF00 0%, #FFFF00 ${
                  ((values[key] - 1) / 4) * 100
                }%, #e5e7eb ${((values[key] - 1) / 4) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <span className="text-xs text-gray-400 w-14 flex-shrink-0">
              5 ({maxLabel})
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
