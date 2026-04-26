"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RadarChart } from "./RadarChart";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { createClient } from "@/lib/supabase/client";
import { containsNGWord } from "@/lib/ngwords";

interface Title {
  id: string;
  name: string;
  description: string;
  achieved_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string;
  store_id: string | null;
  stores: { name: string } | null;
}

interface Props {
  username: string;
  avatarUrl: string | null;
  topTitle: Title | null;
  titles: Title[];
  stats: {
    totalReviews: number;
    visitedStores: number;
    totalLikes: number;
  };
  avgParams: number[];
  reviews: Review[];
  userId: string;
}

export function MypageClient({ username, avatarUrl, topTitle, titles, stats, avgParams, reviews, userId }: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(username);
  const [currentUsername, setCurrentUsername] = useState(username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const router = useRouter();

  const handleSaveUsername = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setUsernameError("ユーザー名を入力してください");
      return;
    }
    if (containsNGWord(trimmed)) {
      setUsernameError("使用できない言葉が含まれています");
      return;
    }
    setSavingUsername(true);
    setUsernameError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ username: trimmed })
      .eq("id", userId);
    setSavingUsername(false);
    if (error) {
      setUsernameError("保存に失敗しました");
      return;
    }
    setCurrentUsername(trimmed);
    setEditingUsername(false);
    router.refresh();
  };

  const handleCancelUsername = () => {
    setUsernameInput(currentUsername);
    setUsernameError(null);
    setEditingUsername(false);
  };

  return (
    <>
      {/* Profile header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
        <div className="relative">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={username}
              className="w-20 h-20 rounded-full border-4 border-[#FFFF00] object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-[#FFFF00] bg-gray-200 flex items-center justify-center shadow-md">
              <span className="text-2xl font-black text-gray-500">
                {username[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          {editingUsername ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="text-xl font-black text-gray-900 border-b-2 border-[#FFFF00] outline-none px-1 bg-transparent w-48"
                  autoFocus
                  maxLength={30}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUsername();
                    if (e.key === "Escape") handleCancelUsername();
                  }}
                />
                <button
                  onClick={handleSaveUsername}
                  disabled={savingUsername}
                  className="p-1.5 rounded-lg bg-[#FFFF00] text-black hover:bg-yellow-400 transition-colors disabled:opacity-60"
                  title="保存"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelUsername}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  title="キャンセル"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {usernameError && (
                <p className="text-xs text-red-500">{usernameError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{currentUsername}</h1>
              <button
                onClick={() => setEditingUsername(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="ユーザー名を編集"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          {topTitle ? (
            <div className="mt-1 inline-flex items-center gap-1.5 bg-[#FFFF00] text-black px-3 py-1 rounded-full text-xs font-black">
              <span>👑</span>
              <span>{topTitle.name}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">まだ称号がありません</p>
          )}
        </div>
      </section>

      {/* Stats summary */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "総実食数", value: stats.totalReviews, unit: "杯" },
          { label: "制覇店舗", value: stats.visitedStores, unit: "店" },
          { label: "総いいね", value: stats.totalLikes, unit: "件" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p
              className="text-3xl font-black text-black leading-none"
              style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
            >
              {value}
              <span className="text-sm font-bold text-gray-500 ml-0.5">{unit}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Radar chart */}
      <section className="mb-8">
        <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FFFF00] inline-block" />
          My Jiro Identity
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {stats.totalReviews > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                <RadarChart values={avgParams} size={220} />
                <p className="text-xs text-gray-400 mt-2">{stats.totalReviews}件のレビューの平均</p>
              </div>
              <div className="flex-1 w-full space-y-3">
                {[
                  { label: "麺の太さ", value: avgParams[0] },
                  { label: "デロさ", value: avgParams[1] },
                  { label: "野菜量", value: avgParams[2] },
                  { label: "麺量", value: avgParams[3] },
                  { label: "神豚度", value: avgParams[4] },
                  { label: "乳化度", value: avgParams[5] },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFFF00] rounded-full"
                        style={{ width: `${((value - 1) / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-gray-800 w-8 text-right">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">レビューを投稿するとチャートが表示されます</p>
            </div>
          )}
        </div>
      </section>

      {/* Titles */}
      {titles.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FFFF00] inline-block" />
            獲得称号 ({titles.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {titles.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  i === 0 ? "border-[#FFFF00] bg-yellow-50" : "border-gray-100 bg-white"
                } shadow-sm`}
              >
                <span className="text-2xl flex-shrink-0">{i === 0 ? "👑" : "🏅"}</span>
                <div>
                  <p className="text-sm font-black text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review history */}
      <section className="mb-12">
        <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FFFF00] inline-block" />
          レビュー履歴
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            <p className="text-sm">まだレビューがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/reviews/${r.id}`)}
              >
                <div className="flex-shrink-0">
                  {r.images && r.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">🍜</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {r.store_id ? (
                    <Link
                      href={`/stores/${r.store_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-bold text-gray-900 truncate hover:underline block"
                    >
                      {r.stores?.name ?? "—"}
                    </Link>
                  ) : (
                    <p className="text-sm font-bold text-gray-900 truncate">{r.stores?.name ?? "—"}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`text-sm ${n <= r.rating ? "text-[#FFFF00]" : "text-gray-200"}`}>★</span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{r.rating.toFixed(1)}</span>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Calendar link */}
      <section className="mb-6">
        <Link
          href="/calendar"
          className="flex items-center gap-3 w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#FFFF00] transition-all"
        >
          <CalendarDays className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">訪問カレンダー</p>
            <p className="text-xs text-gray-400">月ごとの訪問履歴を確認</p>
          </div>
          <span className="ml-auto text-gray-300 text-sm">→</span>
        </Link>
      </section>

      {/* Danger zone */}
      <section className="border-t border-gray-100 pt-6">
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          アカウントを退会する
        </button>
      </section>

      {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} />}
    </>
  );
}
