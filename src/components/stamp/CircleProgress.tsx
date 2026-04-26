"use client";

interface Props {
  visited: number;
  total: number;
  size?: number;
}

export function CircleProgress({ visited, total, size = 160 }: Props) {
  const pct = total > 0 ? visited / total : 0;
  const r = (size - 20) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct);
  const cx = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Background ring */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f3f4f6" strokeWidth={12} />
        {/* Progress ring */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#FFFF00"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span
          className="text-4xl font-black leading-none text-black"
          style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
        >
          {visited}
        </span>
        <span className="text-xs text-gray-500 font-bold">/ {total}店</span>
        <span className="text-xs text-gray-400 mt-0.5">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
