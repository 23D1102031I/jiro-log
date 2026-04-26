"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Flame, Star, Target, Pencil, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ─── 型定義 ───────────────────────────────────────────
type CallValue = "抜き" | "少なめ" | "標準" | "マシ" | "マシマシ";

interface ReviewData {
  id: string;
  date: string;
  store_name: string;
  store_id: string | null;
  store_address: string | null;
  rating: number;
  comment: string | null;
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
// ─── ユーティリティ ────────────────────────────────────
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDow(y: number, m: number) { return new Date(y, m, 1).getDay(); }
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
    if (dateSet.has(toDateStr(cur))) { streak++; cur.setDate(cur.getDate() - 1); }
    else break;
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
  return {
    start, end,
    startDT: `${start}T00:00:00`,
    nextStartDT: `${nextY}-${pad(nextM)}-01T00:00:00`,
  };
}

type RawRow = Record<string, unknown>;

function mapToReviewData(data: RawRow[]): ReviewData[] {
  return data.map((r) => {
    const store = Array.isArray(r.stores) ? r.stores[0] : r.stores;
    return {
      id: r.id as string,
      date: ((r.eaten_at ?? r.created_at) as string).slice(0, 10),
      store_name: (store as { name: string } | null)?.name ?? "不明",
      store_id: (store as { id: string } | null)?.id ?? null,
      store_address: (store as { address: string } | null)?.address ?? null,
      rating: r.rating as number,
      comment: r.comment as string | null,
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
    const store = Array.isArray(r.stores) ? r.stores[0] : r.stores;
    return {
      store_id: (store as { id: string } | null)?.id ?? null,
      rating: r.rating as number,
      call_garlic: r.call_garlic as CallValue | null,
      call_yasai: r.call_yasai as CallValue | null,
      call_abura: r.call_abura as CallValue | null,
    };
  });
}

// ─── 選択日レビューカード ──────────────────────────────
function ReviewCard({ review }: { review: ReviewData }) {
  const activeCalls = [
    { label: "ヤサイ", value: review.call_yasai },
    { label: "ニンニク", value: review.call_garlic },
    { label: "アブラ", value: review.call_abura },
    { label: "カラメ", value: review.call_karame },
  ].filter(c => c.value && c.value !== "標準");

  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden snap-start flex flex-col">
      {/* サムネイル */}
      {review.images?.[0] ? (
        <div className="aspect-video overflow-hidden bg-gray-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={review.images[0]} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-gray-50 flex items-center justify-center text-4xl flex-shrink-0">🍜</div>
      )}

      {/* コンテンツ */}
      <div className="p-4 flex flex-col flex-1">
        {/* 店舗名 */}
        {review.store_id ? (
          <Link href={`/stores/${review.store_id}`} onClick={(e) => e.stopPropagation()} className="font-black text-sm text-gray-900 hover:underline block mb-1 leading-tight">
            {review.store_name}
          </Link>
        ) : (
          <p className="font-black text-sm text-gray-900 mb-1 leading-tight">{review.store_name}</p>
        )}

        {/* 評価 */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`} />
          ))}
          <span className="text-xs font-black ml-0.5">{Number(review.rating).toFixed(1)}</span>
        </div>

        {/* コール */}
        {activeCalls.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {activeCalls.map(({ label, value }) => (
              <span
                key={label}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  ["マシ", "マシマシ"].includes(value!)
                    ? "bg-[#FFFF00] text-black border border-black/10"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {label}: {value}
              </span>
            ))}
          </div>
        )}

        {/* コメント */}
        {review.comment && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-3 flex-1">
            {review.comment}
          </p>
        )}

        {/* ボタン */}
        <Link
          href={`/reviews/${review.id}`}
          className="mt-auto block w-full py-2.5 bg-black text-[#FFFF00] font-bold text-xs text-center rounded-xl hover:bg-gray-800 transition-colors"
        >
          レビューを見る →
        </Link>
      </div>
    </div>
  );
}

// ─── 先月比バッジ ──────────────────────────────────────
function Diff({ curr, prev, format }: { curr: number; prev: number; format: (n: number) => string }) {
  const d = curr - prev;
  if (d === 0) return <span className="text-[10px] text-gray-400">±{format(0)}</span>;
  const pos = d > 0;
  return (
    <span className={`text-[10px] font-bold ${pos ? "text-green-500" : "text-red-500"}`}>
      {pos ? "▲+" : "▼"}{format(Math.abs(d))}
    </span>
  );
}

// ─── メインコンポーネント ──────────────────────────────
interface Props { userId: string; isOwner: boolean; }

export function CalendarView({ userId, isOwner }: Props) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [allDateStrings, setAllDateStrings] = useState<string[]>([]);
  const [initLoading, setInitLoading] = useState(true);
  const [monthReviews, setMonthReviews] = useState<ReviewData[]>([]);
  const [prevReviews, setPrevReviews] = useState<PrevData[]>([]);
  const [monthLoading, setMonthLoading] = useState(true);

  const [monthGoal, setMonthGoal] = useState(15);
  const [yearGoal, setYearGoal] = useState(150);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ month: 15, year: 150 });

  useEffect(() => {
    createClient()
      .from("reviews")
      .select("eaten_at, created_at")
      .eq("user_id", userId)
      .then(({ data }) => {
        setAllDateStrings((data ?? []).map(r => ((r.eaten_at ?? r.created_at) as string).slice(0, 10)));
        setInitLoading(false);
      });
  }, [userId]);

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
        .select("id, eaten_at, created_at, rating, comment, images, call_garlic, call_yasai, call_abura, call_karame, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, stores(id, name, address)")
        .eq("user_id", userId)
        .or(orFilter(curr))
        .order("created_at", { ascending: true }),
      supabase
        .from("reviews")
        .select("eaten_at, created_at, rating, call_garlic, call_yasai, call_abura, stores(id)")
        .eq("user_id", userId)
        .or(orFilter(prev))
        .order("created_at", { ascending: true }),
    ]).then(([c, p]) => {
      setMonthReviews(mapToReviewData((c.data ?? []) as RawRow[]));
      setPrevReviews(mapToPrevData((p.data ?? []) as RawRow[]));
      setMonthLoading(false);
    });
  }, [userId, year, month]);

  useEffect(() => {
    if (!isOwner) return;
    try {
      const saved = localStorage.getItem("jiro-log-goals");
      if (saved) {
        const { monthGoal: mg, yearGoal: yg } = JSON.parse(saved);
        if (mg) { setMonthGoal(mg); setGoalDraft(d => ({ ...d, month: mg })); }
        if (yg) { setYearGoal(yg); setGoalDraft(d => ({ ...d, year: yg })); }
      }
    } catch { /* noop */ }
  }, [isOwner]);

  const isCurrentOrFuture =
    year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth());

  const goToPrev = useCallback(() => {
    setSelectedDate(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  }, [month]);

  const goToNext = useCallback(() => {
    if (isCurrentOrFuture) return;
    setSelectedDate(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  }, [month, isCurrentOrFuture]);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(null);
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

  const totalReviews = monthReviews.length;
  const uniqueStores = new Set(monthReviews.map(r => r.store_id).filter(Boolean)).size;
  const avgRating = totalReviews > 0 ? monthReviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0;

  const prevTotal = prevReviews.length;
  const prevUniqueStores = new Set(prevReviews.map(r => r.store_id).filter(Boolean)).size;
  const prevAvgRating = prevTotal > 0 ? prevReviews.reduce((a, r) => a + r.rating, 0) / prevTotal : 0;

  const { streak, recentDays } = calcStreak(allDateStrings);
  const yearCount = allDateStrings.filter(d => d.startsWith(String(today.getFullYear()))).length;
  const selectedReviews = selectedDate ? (reviewsByDate[selectedDate] ?? []) : [];

  const saveGoal = () => {
    setMonthGoal(goalDraft.month);
    setYearGoal(goalDraft.year);
    try { localStorage.setItem("jiro-log-goals", JSON.stringify({ monthGoal: goalDraft.month, yearGoal: goalDraft.year })); } catch { /* noop */ }
    setShowGoalModal(false);
  };

  if (initLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#FFFF00] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {/* ① 2カラム: カレンダー | スタッツ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ─ 左: カレンダー ─ */}
        <div>
          {/* 月ナビ */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={goToPrev} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="前月">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xl font-black flex-1 text-center">{year}年 {month + 1}月</span>
            <button onClick={goToNext} disabled={isCurrentOrFuture} className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="翌月">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-xs font-bold bg-black text-[#FFFF00] rounded-lg hover:bg-gray-800 transition-colors">
              今月
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-bold py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>
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
            <div className="grid grid-cols-7 gap-1.5 mb-6">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`blank-${idx}`} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayReviews = reviewsByDate[dateStr] ?? [];
                const hasReview = dayReviews.length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = toDateStr(today) === dateStr;
                const thumb = dayReviews[0]?.images?.[0] ?? null;
                const shortName = dayReviews[0]?.store_name
                  ?.replace("ラーメン二郎 ", "").replace("ラーメン二郎", "").slice(0, 4) ?? "";

                return (
                  <button
                    key={dateStr}
                    onClick={() => hasReview && setSelectedDate(isSelected ? null : dateStr)}
                    disabled={!hasReview}
                    className={[
                      "relative aspect-square rounded-xl overflow-hidden transition-all text-xs",
                      isSelected ? "ring-2 ring-black shadow-lg" : "",
                      isToday && !isSelected ? "ring-2 ring-gray-400" : "",
                      hasReview ? "cursor-pointer" : "cursor-default",
                    ].join(" ")}
                  >
                    {/* 背景 */}
                    {hasReview && thumb ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className={`absolute inset-0 ${isSelected ? "bg-black/10" : "bg-black/45"}`} />
                      </>
                    ) : (
                      <div className={`absolute inset-0 ${
                        isSelected ? "bg-[#FFFF00]" :
                        hasReview ? "bg-yellow-50" : "bg-gray-50"
                      }`} />
                    )}

                    {/* コンテンツ */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-0.5 p-1">
                      <span className={`text-xs leading-none font-bold ${
                        thumb ? "text-white drop-shadow" :
                        isSelected ? "text-black" :
                        hasReview ? "text-gray-900" : "text-gray-300"
                      }`}>{day}</span>
                      {hasReview && !thumb && <span className="text-sm leading-none">🍜</span>}
                      {hasReview && shortName && (
                        <span className={`text-[8px] leading-tight font-bold truncate w-full text-center ${
                          thumb ? "text-white/90 drop-shadow" : isSelected ? "text-black" : "text-gray-600"
                        }`}>{shortName}</span>
                      )}
                    </div>

                    {/* 複数バッジ */}
                    {dayReviews.length > 1 && (
                      <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-[9px] font-black z-20">
                        {dayReviews.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ストリーク */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-gray-300"}`} />
              <span className="font-black text-sm">{streak > 0 ? `${streak}日連続！` : "連続記録なし"}</span>
            </div>
            <div className="flex gap-2 justify-between">
              {recentDays.map(({ date, day, visited }) => (
                <div key={date} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    visited ? "bg-[#FFFF00] border-2 border-black text-black" : "bg-gray-100 text-gray-400"
                  }`}>{visited ? "✓" : ""}</div>
                  <span className="text-[10px] text-gray-400">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─ 右: スタッツ + 目標 ─ */}
        <div className="space-y-4">
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
                  { label: "今月の実食数", icon: "🍜", value: `${totalReviews}杯`, diff: <Diff curr={totalReviews} prev={prevTotal} format={n => `${n}杯`} /> },
                  { label: "訪問店舗数", icon: "📍", value: `${uniqueStores}店`, diff: <Diff curr={uniqueStores} prev={prevUniqueStores} format={n => `${n}店`} /> },
                  { label: "平均評価", icon: "⭐", value: totalReviews > 0 ? avgRating.toFixed(2) : "—", diff: totalReviews > 0 && prevTotal > 0 ? <Diff curr={avgRating} prev={prevAvgRating} format={n => n.toFixed(2)} /> : null },
                ] as { label: string; icon: string; value: string; diff: React.ReactNode }[]).map(({ label, value, icon, diff }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{icon}</span>
                      <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                    </div>
                    <p className="text-2xl font-black text-black leading-none mb-1" style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}>
                      {value}
                    </p>
                    {diff}
                  </div>
                ))}
              </div>
            )}
          </div>

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
                {[
                  { label: "今月の目標", curr: totalReviews, goal: monthGoal },
                  { label: "年間目標", curr: yearCount, goal: yearGoal },
                ].map(({ label, curr, goal }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-bold">{curr} / {goal}杯</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFFF00] rounded-full transition-all" style={{ width: `${Math.min((curr / goal) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ③ 選択日レビューパネル（全幅・横スクロール） */}
      {selectedDate && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-black text-base text-gray-900">{selectedDate.replace(/-/g, "/")}</span>
              <span className="ml-2 text-sm text-gray-400">{selectedReviews.length}件のレビュー</span>
            </div>
            <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
            {selectedReviews.map(review => <ReviewCard key={review.id} review={review} />)}
          </div>
        </div>
      )}

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
              {[
                { label: "今月の目標（杯）", key: "month" as const, min: 1, max: 200 },
                { label: "年間目標（杯）", key: "year" as const, min: 1, max: 2000 },
              ].map(({ label, key, min, max }) => (
                <div key={key}>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">{label}</label>
                  <input
                    type="number" min={min} max={max}
                    value={goalDraft[key]}
                    onChange={e => setGoalDraft(d => ({ ...d, [key]: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowGoalModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                キャンセル
              </button>
              <button onClick={saveGoal} className="flex-1 py-2.5 bg-[#FFFF00] text-black rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors">
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
