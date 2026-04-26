"use client";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

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

const DAY_JP: Record<DayKey, string> = {
  mon: "月", tue: "火", wed: "水", thu: "木", fri: "金", sat: "土", sun: "日",
};
const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface DayGroup {
  days: DayKey[];
  hours: DayHours;
}

function groupByHours(w: WeeklyHours): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const key of DAY_ORDER) {
    const hours = w[key];
    const sig = JSON.stringify(hours);
    const existing = groups.find((g) => JSON.stringify(g.hours) === sig);
    if (existing) {
      existing.days.push(key);
    } else {
      groups.push({ days: [key], hours });
    }
  }
  return groups;
}

function getTodayKey(): DayKey {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const keys: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return keys[jst.getUTCDay()];
}

function formatHours(hours: NonNullable<DayHours>): string {
  if (hours.dinner) {
    return `${hours.open} - ${hours.close} / ${hours.dinner.open} - ${hours.dinner.close}`;
  }
  return `${hours.open} - ${hours.close}`;
}

interface Props {
  weeklyHours: WeeklyHours;
  closedDays?: string | null;
}

export function WeeklyHoursPanel({ weeklyHours, closedDays }: Props) {
  const groups = groupByHours(weeklyHours);
  const todayKey = getTodayKey();
  const hasHoliday = closedDays ? /祝/.test(closedDays) : false;

  return (
    <div className="space-y-2">
      {weeklyHours.irregular && (
        <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 font-medium">
          ⚠️ 不定休あり — SNS等で最新情報をご確認ください
        </div>
      )}

      {groups.map((group, i) => {
        const isClosed = group.hours === null;
        const isToday = group.days.includes(todayKey);

        // 曜日ラベル: "月・火・水・木・金・土" 形式
        let dayLabel = group.days.map((d) => DAY_JP[d]).join("・");
        // 定休日グループに祝日を付加
        if (isClosed && hasHoliday) dayLabel += "・祝日";

        return (
          <div key={i} className="flex gap-3 items-start text-sm">
            {/* 今日インジケーター */}
            <div className={`w-1 rounded-full mt-0.5 self-stretch flex-shrink-0 ${isToday ? "bg-[#FFFF00]" : "bg-transparent"}`} />
            <div className="flex-1">
              <p className={`font-bold leading-tight ${isClosed ? "text-gray-400" : isToday ? "text-black" : "text-gray-700"}`}>
                {dayLabel}
              </p>
              <p className={`mt-0.5 ${isClosed ? "text-gray-400" : "text-gray-900 font-medium"}`}>
                {isClosed ? "定休日" : formatHours(group.hours!)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
