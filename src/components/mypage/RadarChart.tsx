"use client";

const LABELS = ["麺の太さ", "デロさ", "野菜量", "麺量", "神豚度", "乳化度"] as const;
const N = LABELS.length;

interface Props {
  values: number[]; // 1–5, length 6
  size?: number;
}

export function RadarChart({ values, size = 220 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const labelR = r + size * 0.16;

  function polar(index: number, radius: number): [number, number] {
    const angle = (Math.PI * 2 * index) / N - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  // Grid rings (1–5)
  const rings = [1, 2, 3, 4, 5].map((level) => {
    const pts = Array.from({ length: N }, (_, i) => polar(i, (r * level) / 5));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";
  });

  // Data polygon
  const dataPoints = values.map((v, i) => polar(i, (r * Math.min(Math.max(v, 1), 5)) / 5));
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";

  // Axis lines
  const axes = Array.from({ length: N }, (_, i) => {
    const [x, y] = polar(i, r);
    return { x, y };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none" overflow="visible">
      {/* Grid rings */}
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {/* Axis lines */}
      {axes.map(({ x, y }, i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {/* Data polygon */}
      <path d={dataPath} fill="rgba(255,255,0,0.35)" stroke="#cccc00" strokeWidth={2} />
      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#FFFF00" stroke="#000" strokeWidth={1.5} />
      ))}
      {/* Labels */}
      {LABELS.map((label, i) => {
        const [x, y] = polar(i, labelR);
        const anchor =
          Math.abs(x - cx) < 5 ? "middle" : x < cx ? "end" : "start";
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={size * 0.055}
            fontWeight="bold"
            fill="#374151"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
