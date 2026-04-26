"use client";

import { useState } from "react";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MIN_SAMPLES = 3;
const CHART_H = 160;
const BAR_W = 28;
const BAR_GAP = 8;
const BAR_STEP = BAR_W + BAR_GAP;
const PAD_LEFT = 40;
const PAD_BOTTOM = 40;

export type HourSlot = { hour: number; avgWait: number; count: number };
export type DayStats = { slots: HourSlot[]; totalCount: number };

interface Props {
  data: Record<number, DayStats>; // 0=日, 1=月, ..., 6=土
}

export function WaitTimeChart({ data }: Props) {
  const [selectedDow, setSelectedDow] = useState<number>(() => {
    for (let d = 1; d <= 7; d++) {
      const dow = d % 7;
      if ((data[dow]?.totalCount ?? 0) >= MIN_SAMPLES) return dow;
    }
    return 1;
  });

  const dayData = data[selectedDow];
  const hasData = (dayData?.totalCount ?? 0) >= MIN_SAMPLES;
  const slots = hasData ? dayData.slots : [];

  const minHour = slots.length > 0 ? Math.min(Math.min(...slots.map(s => s.hour)), 9) : 9;
  const maxHour = slots.length > 0 ? Math.max(Math.max(...slots.map(s => s.hour)), 20) : 20;
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  const slotMap = Object.fromEntries(slots.map(s => [s.hour, s]));
  const maxWait = slots.length > 0 ? Math.ceil(Math.max(...slots.map(s => s.avgWait)) / 10) * 10 : 60;

  const svgW = PAD_LEFT + hours.length * BAR_STEP + 4;
  const svgH = CHART_H + PAD_BOTTOM;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: CHART_H - f * CHART_H,
    label: `${Math.round(f * maxWait)}分`,
  }));

  return (
    <div>
      {/* 曜日タブ */}
      <div className="flex gap-1 mb-5">
        {DAYS.map((day, dow) => {
          const enough = (data[dow]?.totalCount ?? 0) >= MIN_SAMPLES;
          const active = selectedDow === dow;
          return (
            <button
              key={dow}
              onClick={() => setSelectedDow(dow)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                active
                  ? "bg-black text-[#FFFF00]"
                  : enough
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-300"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {!hasData ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">データが不足しています</p>
          <p className="text-xs text-gray-300 mt-1">
            {dayData?.totalCount ?? 0}件（{MIN_SAMPLES}件以上で表示）
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} overflow="visible" className="select-none">
            {/* グリッド線 + Y軸ラベル */}
            {yTicks.map(({ y, label }) => (
              <g key={label}>
                <line x1={PAD_LEFT} x2={svgW} y1={y} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                <text x={PAD_LEFT - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9ca3af">
                  {label}
                </text>
              </g>
            ))}

            {/* X軸 */}
            <line x1={PAD_LEFT} x2={svgW} y1={CHART_H} y2={CHART_H} stroke="#e5e7eb" strokeWidth={1} />

            {/* 棒 */}
            {hours.map((hour, i) => {
              const slot = slotMap[hour];
              const barH = slot ? (slot.avgWait / maxWait) * CHART_H : 0;
              const x = PAD_LEFT + i * BAR_STEP;
              const y = CHART_H - barH;

              return (
                <g key={hour}>
                  {slot && (
                    <>
                      <rect x={x} y={y} width={BAR_W} height={barH} fill="#FFFF00" rx={3} />
                      {barH >= 18 && (
                        <text x={x + BAR_W / 2} y={y + 11} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#555">
                          {Math.round(slot.avgWait)}分
                        </text>
                      )}
                    </>
                  )}
                  {/* X軸時間ラベル */}
                  <text x={x + BAR_W / 2} y={CHART_H + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
                    {hour}時
                  </text>
                  {/* サンプル数 */}
                  {slot && (
                    <text x={x + BAR_W / 2} y={CHART_H + 28} textAnchor="middle" fontSize={8} fill="#d1d5db">
                      n={slot.count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
