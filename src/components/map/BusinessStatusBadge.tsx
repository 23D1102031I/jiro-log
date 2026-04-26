"use client";

export interface BusinessHours {
  lunch?: { open: string; close: string };
  dinner?: { open: string; close: string };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getJSTMinutes(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const jst = new Date(utc + 9 * 3600000);
  return jst.getHours() * 60 + jst.getMinutes();
}

export type BusinessStatus = "open" | "preparing" | "closed" | "unknown";

export function getBusinessStatus(businessHours: BusinessHours | null | undefined): BusinessStatus {
  if (!businessHours) return "unknown";

  const currentMins = getJSTMinutes();
  const periods = [businessHours.lunch, businessHours.dinner].filter(Boolean) as {
    open: string;
    close: string;
  }[];

  if (periods.length === 0) return "unknown";

  for (const period of periods) {
    const openMins = timeToMinutes(period.open);
    const closeMins = timeToMinutes(period.close);
    if (currentMins >= openMins && currentMins < closeMins) return "open";
    if (currentMins >= openMins - 30 && currentMins < openMins) return "preparing";
  }

  return "closed";
}

const STATUS_CONFIG = {
  open: { label: "営業中", cls: "bg-green-100 text-green-700 border-green-200", dot: true },
  preparing: { label: "準備中", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: false },
  closed: { label: "本日終了", cls: "bg-gray-100 text-gray-500 border-gray-200", dot: false },
  unknown: { label: "情報なし", cls: "bg-gray-50 text-gray-400 border-gray-100", dot: false },
};

export function BusinessStatusBadge({ businessHours }: { businessHours: BusinessHours | null | undefined }) {
  const status = getBusinessStatus(businessHours);
  const { label, cls, dot } = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {label}
    </span>
  );
}
