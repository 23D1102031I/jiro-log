"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Flame, Star, Target, Pencil, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RadarChart } from "@/components/mypage/RadarChart";

// ─── 型定義 ───────────────────────────────────────────
type CallValue = "抜き" | "少なめ" | "標準" | "マシ" | "マシマシ";

interface ReviewData {
  id: string;
  date: string;
  store_name: string;
  store_id: string | null;
  store_address: string | null;
  rating: number;
  images: string[] | null;
  created_at: string;
  call_garlic: CallValue | null;
  call_yasai: CallValue | null;
  call_abura: CallValue | null;
  call_karame: CallValue | null;
  thickness_score: number | null;
  dero_score: number | null;
  vegetable_score: number | null;
  noodle_score: number | null;
  pork_score: number | null;
  emulsification_score: number | null;
}

interface PrevData {
  store_id: string | null;
  rating: number;
  call_garlic: CallValue | null;
  call_yasai: CallValue | null;
  call_abura: CallValue | null;
}

// ─── 定数 ─────────────────────────────────────────────
const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const YASAI_G: Record<string, number> = { 抜き: 0, 少なめ: 150, 標準: 250, マシ: 400, マシマシ: 600 };
const GARLIC_P: Record<string, number> = { 抜き: 0, 少なめ: 30, 標準: 60, マシ: 100, マシマシ: 180 };
const ABURA_ML: Record<string, number> = { 抜き: 0, 少なめ: 30, 標準: 80, マシ: 150, マシマシ: 250 };

// ─── ユーティリティ ────────────────────────────────────
function getCallAmt(val: CallValue | null, map: Record<string, number>): number {
  return map[val ?? "標準"] ?? map["標準"] ?? 0;
}

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function getFirstDow(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStreak(allDates: string[]) {
  const dateSet = new Set(allDates);
  const today = new Date();
  const todayStr = toDateStr(today);
  let streak = 0;
  const cur = new Date(today);

  if (!dateSet.has(todayStr)) cur.setDate(cur.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const s = toDateStr(cur);
    if (dateSet.has(s)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { date: toDateStr(d), day: d.getDate(), visited: dateSet.has(toDateStr(d)) };
  });

  return { streak, recentDays };
}

function makeMonthRange(y: number, m: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${y}-${pad(m + 1)}-01`;
  const end = `${y}-${pad(m + 1)}-${pad(getDaysInMonth(y, m))}`;
  const nextY = m === 11 ? y + 1 : y;
  const nextM = m === 11 ? 1 : m + 2;
  const nextStart = `${nextY}-${pad(nextM)}-01`;
  return {
    start,
    end,
    startDT: `${start}T00:00:00`,
    nextStartDT: `${nextStart}T00:00:00`,
  };
}

type RawRow = Record<string, unknown>;

function mapToReviewData(data: RawRow[]): ReviewData[] {
  return data.map((r) => {
    const storeRaw = r.stores;
    const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw;
    return {
      id: r.id as string,
      date: ((r.eaten_at ?? r.created_at) as string).slice(0, 10),
      store_name: (store as { name: string } | null)?.name ?? "不明",
      store_id: (store as { id: string } | null)?.id ?? null,
      store_address: (store as { address: string } | null)?.address ?? null,
      rating: r.rating as number,
      images: r.images as string[] | null,
      created_at: r.created_at as string,
      call_garlic: r.call_garlic as CallValue | null,
      call_yasai: r.call_yasai as CallValue | null,
      call_abura: r.call_abura as CallValue | null,
      call_karame: r.call_karame as CallValue | null,
      thickness_score: r.thickness_score as number | null,
      dero_score: r.dero_score as number | null,
      vegetable_score: r.vegetable_score as number | null,
      noodle_score: r.noodle_score as number | null,
      pork_score: r.pork_score as number | null,
      emulsification_score: r.emulsification_score as number | null,
    };
  });
}

function mapToPrevData(data: RawRow[]): PrevData[] {
  return data.map((r) => {
    const storeRaw = r.stores;
    const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw;
    return {
      store_id: (store as { id: string } | null)?.id ?? null,
      rating: r.rating as number,
      call_garlic: r.call_garlic as CallValue | null,
      call_yasai: r.call_yasai as CallValue | null,
      call_abura: r.call_abura as CallValue | null,
    };
  });
}

// ─── 先月比バッジ ──────────────────────────────────────
function Diff({
  curr,
  prev,
  format,
}: {
  curr: number;
  prev: number;
  format: (n: number) => string;
}) {
  const d = curr - prev;
  if (d === 0) return <span className="text-[10px] text-gray-400">±{format(0)}</span>;
  const isPos = d > 0;
  return (
    <span className={`text-[10px] font-bold ${isPos ? "text-green-500" : "text-red-500"}`}>
      {isPos ? "▲+" : "▼"}{format(Math.abs(d))}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────
interface Props {
  userId: string;
  isOwner: boolean;
}

// ─── メインコンポーネント ──────────────────────────────
export function CalendarView({ userId, isOwner }: Props) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateStr(today));
  const [selectedReviewIdx, setSelectedReviewIdx] = useState(0);

  // クエリ①: ストリーク用・全期間日付リスト
  const [allDateStrings, setAllDateStrings] = useState<string[]>([]);
  const [initLoading, setInitLoading] = useState(true);

  // クエリ②: 当月フル + 前月サマリー
  const [monthReviews, setMonthReviews] = useState<ReviewData[]>([]);
  const [prevReviews, setPrevReviews] = useState<PrevData[]>([]);
  const [monthLoading, setMonthLoading] = useState(true);

  // 目標
  const [monthGoal, setMonthGoal] = useState(15);
  const [yearGoal, setYearGoal] = useState(150);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ month: 15, year: 150 });

  // クエリ①: マウント時に全期間の日付のみ取得
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("eaten_at, created_at")
      .eq("user_id", userId)
      .then(({ data }) => {
        const dates = (data ?? []).map((r) =>
          ((r.eaten_at ?? r.created_at) as string).slice(0, 10)
        );
        setAllDateStrings(dates);
        setInitLoading(false);
      });
  }, [userId]);

  // クエリ②: 月切り替えのたびに当月 + 前月を並行取得
  useEffect(() => {
    setMonthLoading(true);
    const supabase = createClient();

    const curr = makeMonthRange(year, month);
    const prevY = month === 0 ? year - 1 : year;
    const prevM = month === 0 ? 11 : month - 1;
    const prev = makeMonthRange(prevY, prevM);

    const orFilter = (r: ReturnType<typeof makeMonthRange>) =>
      `and(eaten_at.gte.${r.start},eaten_at.lte.${r.end}),and(eaten_at.is.null,created_at.gte.${r.startDT},created_at.lt.${r.nextStartDT})`;

    Promise.all([
      supabase
        .from("reviews")
        .select(
          "id, eaten_at, created_at, rating, images, call_garlic, call_yasai, call_abura, call_karame, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, stores(id, name, address)"
        )
        .eq("user_id", userId)
        .or(orFilter(curr))
        .order("created_at", { ascending: true }),
      supabase
        .from("reviews")
        .select("eaten_at, created_at, rating, call_garlic, call_yasai, call_abura, stores(id)")
        .eq("user_id", userId)
        .or(orFilter(prev))
        .order("created_at", { ascending: true }),
    ]).then(([currRes, prevRes]) => {
      setMonthReviews(mapToReviewData((currRes.data ?? []) as RawRow[]));
      setPrevReviews(mapToPrevData((prevRes.data ?? []) as RawRow[]));
      setMonthLoading(false);
    });
  }, [userId, year, month]);

  // localStorageから目標読み込み
  useEffect(() => {
    if (!isOwner) return;
    try {
      const saved = localStorage.getItem("jiro-log-goals");
      if (saved) {
        const { monthGoal: mg, yearGoal: yg } = JSON.parse(saved);
        if (mg) { setMonthGoal(mg); setGoalDraft((d) => ({ ...d, month: mg })); }
        if (yg) { setYearGoal(yg); setGoalDraft((d) => ({ ...d, year: yg })); }
      }
    } catch { /* noop */ }
  }, [isOwner]);

  // 月ナビ
  const isCurrentOrFuture =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month >= today.getMonth());

  const goToPrev = useCallback(() => {
    setSelectedDate(null);
    setSelectedReviewIdx(0);
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }, [month]);

  const goToNext = useCallback(() => {
    if (isCurrentOrFuture) return;
    setSelectedDate(null);
    setSelectedReviewIdx(0);
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }, [month, isCurrentOrFuture]);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(toDateStr(today));
    setSelectedReviewIdx(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 派生データ
  const reviewsByDate = monthReviews.reduce<Record<string, ReviewData[]>>((acc, r) => {
    (acc[r.date] = acc[r.date] ?? []).push(r);
    return acc;
  }, {});

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDow(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 当月統計
  const totalReviews = monthReviews.length;
  const uniqueStores = new Set(monthReviews.map((r) => r.store_id).filter(Boolean)).size;
  const totalYasai = monthReviews.reduce((a, r) => a + getCallAmt(r.call_yasai, YASAI_G), 0);
  const totalGarlic = monthReviews.reduce((a, r) => a + getCallAmt(r.call_garlic, GARLIC_P), 0);
  const totalAbura = monthReviews.reduce((a, r) => a + getCallAmt(r.call_abura, ABURA_ML), 0);
  const avgRating = totalReviews > 0
    ? monthReviews.reduce((a, r) => a + r.rating, 0) / totalReviews
    : 0;

  // 前月統計（先月比用）
  const prevTotal = prevReviews.length;
  const prevUniqueStores = new Set(prevReviews.map((r) => r.store_id).filter(Boolean)).size;
  const prevYasai = prevReviews.reduce((a, r) => a + getCallAmt(r.call_yasai, YASAI_G), 0);
  const prevGarlic = prevReviews.reduce((a, r) => a + getCallAmt(r.call_garlic, GARLIC_P), 0);
  const prevAbura = prevReviews.reduce((a, r) => a + getCallAmt(r.call_abura, ABURA_ML), 0);
  const prevAvgRating = prevTotal > 0
    ? prevReviews.reduce((a, r) => a + r.rating, 0) / prevTotal
    : 0;

  // ストリーク（全期間日付から計算）
  const { streak, recentDays } = calcStreak(allDateStrings);

  // 年間カウント（全期間日付から計算）
  const yearCount = allDateStrings.filter((d) =>
    d.startsWith(String(today.getFullYear()))
  ).length;

  // 選択日のレビュー
  const selectedReviews = selectedDate ? (reviewsByDate[selectedDate] ?? []) : [];
  const selectedReview = selectedReviews[selectedReviewIdx] ?? null;

  const radarValues = selectedReview
    ? [
        selectedReview.thickness_score ?? 3,
        selectedReview.dero_score ?? 3,
        selectedReview.vegetable_score ?? 3,
        selectedReview.noodle_score ?? 3,
        selectedReview.pork_score ?? 3,
        selectedReview.emulsification_score ?? 3,
      ]
    : [3, 3, 3, 3, 3, 3];

  const callItems = selectedReview
    ? [
        { label: "ヤサイ", value: selectedReview.call_yasai },
        { label: "ニンニク", value: selectedReview.call_garlic },
        { label: "アブラ", value: selectedReview.call_abura },
        { label: "カラメ", value: selectedReview.call_karame },
      ]
    : [];

  const saveGoal = () => {
    setMonthGoal(goalDraft.month);
    setYearGoal(goalDraft.year);
    try {
      localStorage.setItem(
        "jiro-log-goals",
        JSON.stringify({ monthGoal: goalDraft.month, yearGoal: goalDraft.year })
      );
    } catch { /* noop */ }
    setShowGoalModal(false);
  };

  if (initLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#FFFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ═══════════ 左カラム ═══════════ */}
        <div>
          {/* 月ナビ */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={goToPrev} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="前月">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xl font-black flex-1 text-center">
              {year}年 {month + 1}月
            </span>
            <button
              onClick={goToNext}
              disabled={isCurrentOrFuture}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="翌月"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-bold bg-black text-[#FFFF00] rounded-lg hover:bg-gray-800 transition-colors"
            >
              今日
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-bold py-2 ${
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          {monthLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#FFFF00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 mb-6">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`blank-${idx}`} />;

                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayReviews = reviewsByDate[dateStr] ?? [];
                const hasReview = dayReviews.length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = toDateStr(today) === dateStr;
                const shortName = dayReviews[0]?.store_name
                  ?.replace("ラーメン二郎 ", "")
                  .replace("ラーメン二郎", "")
                  .slice(0, 3) ?? "";

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (hasReview) {
                        setSelectedDate(isSelected ? null : dateStr);
                        setSelectedReviewIdx(0);
                      }
                    }}
                    disabled={!hasReview}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all p-1 gap-0.5
                      ${isSelected
                        ? "bg-[#FFFF00] ring-2 ring-black shadow-md"
                        : hasReview
                          ? "bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
                          : "cursor-default"}
                      ${isToday && !isSelected ? "ring-2 ring-gray-400" : ""}
                    `}
                  >
                    <span className={`text-xs leading-none ${isToday ? "font-black" : "font-medium"}`}>{day}</span>
                    {hasReview && (
                      <>
                        <span className="text-sm leading-none">🍜</span>
                        {shortName && (
                          <span className={`text-[8px] leading-tight font-bold truncate w-full text-center ${isSelected ? "text-black" : "text-gray-600"}`}>
                            {shortName}
                          </span>
                        )}
                      </>
                    )}
                    {dayReviews.length > 1 && (
                      <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-[8px] font-black">
                        {dayReviews.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 連続実食ストリーク */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-gray-300"}`} />
              <span className="font-black text-sm">
                {streak > 0 ? `${streak}日連続！` : "連続記録なし"}
              </span>
            </div>
            <div className="flex gap-2 justify-between">
              {recentDays.map(({ date, day, visited }) => (
                <div key={date} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      visited ? "bg-[#FFFF00] border-2 border-black text-black" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {visited ? "✓" : ""}
                  </div>
                  <span className="text-[10px] text-gray-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 目標プログレスバー（isOwner のみ） */}
          {isOwner && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-black text-gray-800">目標</span>
                </div>
                <button
                  onClick={() => { setGoalDraft({ month: monthGoal, year: yearGoal }); setShowGoalModal(true); }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  編集
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">今月の目標</span>
                    <span className="text-xs font-bold">{totalReviews} / {monthGoal}杯</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFFF00] rounded-full transition-all"
                      style={{ width: `${Math.min((totalReviews / monthGoal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">年間目標</span>
                    <span className="text-xs font-bold">{yearCount} / {yearGoal}杯</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFFF00] rounded-full transition-all"
                      style={{ width: `${Math.min((yearCount / yearGoal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ 右カラム ═══════════ */}
        <div className="space-y-4">

          {/* マンスリー統計 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-black text-gray-800 mb-1">マンスリースタッツ</h3>
            <p className="text-xs text-gray-400 mb-4">{year}年{month + 1}月の記録</p>
            {monthLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-[#FFFF00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {([
                  {
                    label: "今月の実食数", icon: "🍜",
                    value: `${totalReviews}杯`,
                    diff: <Diff curr={totalReviews} prev={prevTotal} format={(n) => `${n}杯`} />,
                  },
                  {
                    label: "訪問店舗数", icon: "📍",
                    value: `${uniqueStores}店`,
                    diff: <Diff curr={uniqueStores} prev={prevUniqueStores} format={(n) => `${n}店`} />,
                  },
                  {
                    label: "総ヤサイ摂取", icon: "🥬",
                    value: totalYasai >= 1000 ? `${(totalYasai / 1000).toFixed(1)}kg` : `${totalYasai}g`,
                    diff: (
                      <Diff
                        curr={totalYasai}
                        prev={prevYasai}
                        format={(n) => n >= 1000 ? `${(n / 1000).toFixed(1)}kg` : `${n}g`}
                      />
                    ),
                  },
                  {
                    label: "平均評価", icon: "⭐",
                    value: totalReviews > 0 ? avgRating.toFixed(2) : "—",
                    diff: (totalReviews > 0 && prevTotal > 0)
                      ? <Diff curr={avgRating} prev={prevAvgRating} format={(n) => n.toFixed(2)} />
                      : null,
                  },
                  {
                    label: "ニンニク摂取", icon: "🧄",
                    value: `${totalGarlic}片`,
                    diff: <Diff curr={totalGarlic} prev={prevGarlic} format={(n) => `${n}片`} />,
                  },
                  {
                    label: "アブラ摂取", icon: "🫙",
                    value: totalAbura >= 1000 ? `${(totalAbura / 1000).toFixed(1)}L` : `${totalAbura}ml`,
                    diff: (
                      <Diff
                        curr={totalAbura}
                        prev={prevAbura}
                        format={(n) => n >= 1000 ? `${(n / 1000).toFixed(1)}L` : `${n}ml`}
                      />
                    ),
                  },
                ] as { label: string; icon: string; value: string; diff: React.ReactNode }[]).map(({ label, value, icon, diff }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{icon}</span>
                      <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                    </div>
                    <p
                      className="text-2xl font-black text-black leading-none mb-1"
                      style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                    >
                      {value}
                    </p>
                    {diff}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 選択した日のログ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-black text-gray-800 mb-1">
              {selectedDate ? "選択した日のログ" : "日付を選択"}
            </h3>
            {selectedDate && (
              <p className="text-xs text-gray-400 mb-4">
                {selectedDate.replace(/-/g, "/")}
              </p>
            )}

            {!selectedReview ? (
              <div className="py-10 text-center text-gray-400">
                <p className="text-3xl mb-3">🍜</p>
                <p className="text-sm">
                  {selectedDate ? "この日の記録はありません" : "カレンダーの日付をクリック"}
                </p>
              </div>
            ) : (
              <div>
                {/* 複数レビュータブ */}
                {selectedReviews.length > 1 && (
                  <div className="flex gap-1.5 mb-4 overflow-x-auto">
                    {selectedReviews.map((r, i) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReviewIdx(i)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          selectedReviewIdx === i
                            ? "bg-[#FFFF00] text-black"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}杯目
                      </button>
                    ))}
                  </div>
                )}

                {/* 画像 */}
                {selectedReview.images?.[0] && (
                  <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedReview.images[0]}
                      alt={selectedReview.store_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 店舗名 + 時刻 */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  {selectedReview.store_id ? (
                    <Link
                      href={`/stores/${selectedReview.store_id}`}
                      className="font-black text-sm text-gray-900 hover:underline"
                    >
                      {selectedReview.store_name}
                    </Link>
                  ) : (
                    <p className="font-black text-sm text-gray-900">{selectedReview.store_name}</p>
                  )}
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(selectedReview.created_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {selectedReview.store_address && (
                  <p className="text-xs text-gray-400 mb-3">{selectedReview.store_address}</p>
                )}

                {/* 評価 */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${n <= selectedReview.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black">{Number(selectedReview.rating).toFixed(1)}</span>
                </div>

                {/* レーダーチャート */}
                <div className="flex justify-center mb-4">
                  <RadarChart values={radarValues} size={160} />
                </div>

                {/* コール */}
                {callItems.some((c) => c.value) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {callItems.map(({ label, value }) =>
                      value ? (
                        <span
                          key={label}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            ["マシ", "マシマシ"].includes(value)
                              ? "bg-[#FFFF00] text-black border border-black"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {label}: {value}
                        </span>
                      ) : null
                    )}
                  </div>
                )}

                {/* 詳細ボタン */}
                <Link
                  href={`/reviews/${selectedReview.id}`}
                  className="block w-full py-3 bg-[#FFFF00] text-black font-black text-sm text-center rounded-xl hover:bg-yellow-400 transition-colors"
                >
                  このレビューを見る →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 目標設定モーダル */}
      {showGoalModal && isOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black">目標を設定</h3>
              <button onClick={() => setShowGoalModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">今月の目標（杯）</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={goalDraft.month}
                  onChange={(e) => setGoalDraft((d) => ({ ...d, month: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00]"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">年間目標（杯）</label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={goalDraft.year}
                  onChange={(e) => setGoalDraft((d) => ({ ...d, year: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={saveGoal}
                className="flex-1 py-2.5 bg-[#FFFF00] text-black rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
