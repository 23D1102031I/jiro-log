"use client";

import { useState } from "react";

type DayHours = {
  open: string;
  close: string;
  dinner?: { open: string; close: string };
} | null;

export type WeeklyHours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
  irregular: boolean;
};

const DAY_LABELS: { key: keyof Omit<WeeklyHours, "irregular">; label: string }[] = [
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
  { key: "sun", label: "日" },
];

function getTodayKey(): keyof Omit<WeeklyHours, "irregular"> {
  const now = new Date();
  const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dayIndex = jstDate.getUTCDay(); // 0=Sun, 1=Mon, ...
  const keys: (keyof Omit<WeeklyHours, "irregular">)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return keys[dayIndex];
}

export function WeeklyHoursPanel({ weeklyHours }: { weeklyHours: WeeklyHours }) {
  const todayKey = getTodayKey();
  const [activeKey, setActiveKey] = useState<keyof Omit<WeeklyHours, "irregular">>(todayKey);

  const hours = weeklyHours[activeKey];

  return (
    <div>
      {weeklyHours.irregular && (
        <div className="mb-3 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 font-medium">
          ⚠️ 不定休あり — SNS等で最新情報をご確認ください
        </div>
      )}

      {/* 曜日タブ */}
      <div className="flex gap-1 mb-3">
        {DAY_LABELS.map(({ key, label }) => {
          const isToday = key === todayKey;
          const isActive = key === activeKey;
          const closed = weeklyHours[key] === null;
          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all leading-none ${
                isActive
                  ? "bg-[#FFFF00] text-black border-2 border-black"
                  : isToday
                  ? "bg-yellow-50 text-black border-2 border-[#FFFF00]"
                  : closed
                  ? "bg-gray-50 text-gray-300 border border-gray-100"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
              }`}
            >
              <span className="block">{label}</span>
              {isToday && <span className="block text-[9px] font-normal opacity-60 mt-0.5">今日</span>}
            </button>
          );
        })}
      </div>

      {/* 時間表示 */}
      {hours === null ? (
        <div className="py-3 text-center text-sm text-gray-400 bg-gray-50 rounded-lg">定休日</div>
      ) : (
        <div className="space-y-2 px-1">
          {hours.dinner ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-gray-400 w-14">ランチ</span>
                <span className="font-bold text-gray-900">{hours.open} 〜 {hours.close}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-gray-400 w-14">ディナー</span>
                <span className="font-bold text-gray-900">{hours.dinner.open} 〜 {hours.dinner.close}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs text-gray-400 w-14">営業時間</span>
              <span className="font-bold text-gray-900">{hours.open} 〜 {hours.close}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
