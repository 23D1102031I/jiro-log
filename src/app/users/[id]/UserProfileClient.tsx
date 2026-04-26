"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RadarChart } from "@/components/mypage/RadarChart";
import { CalendarView } from "@/app/calendar/CalendarView";
import { Star } from "lucide-react";

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
  eaten_at: string | null;
  store_id: string | null;
  storeName: string | null;
}

interface Props {
  userId: string;
  username: string;
  avatarUrl: string | null;
  topTitle: Title | null;
  titles: Title[];
  stats: {
    totalReviews: number;
    visitedStores: number;
    totalLikes: number;
  };
  followCounts: {
    following: number;
    followers: number;
  };
  avgParams: number[];
  reviews: Review[];
  currentUserId: string | null;
  isFollowing: boolean;
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-1 h-5 bg-[#FFFF00] inline-block rounded-full" />
      {children}
    </h2>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserProfileClient({
  userId,
  username,
  avatarUrl,
  topTitle,
  titles,
  stats,
  followCounts,
  avgParams,
  reviews,
  currentUserId,
  isFollowing: initialIsFollowing,
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(followCounts.followers);

  const handleFollowToggle = async () => {
    if (!currentUserId || loading) return;
    setLoading(true);

    const supabase = createClient();

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId);
      setIsFollowing(false);
      setFollowerCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: userId,
      });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }

    setLoading(false);
  };

  const showFollowButton = currentUserId && currentUserId !== userId;

  const paramLabels = ["麺の太さ", "デロさ", "野菜量", "麺量", "神豚度", "乳化度"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
      {/* ══════════════════════════════════════════
          LEFT COLUMN — sticky profile sidebar
      ══════════════════════════════════════════ */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={username}
                className="w-24 h-24 rounded-full border-4 border-[#FFFF00] object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-[#FFFF00] bg-gray-200 flex items-center justify-center shadow-md">
                <span className="text-3xl font-black text-gray-500">
                  {username[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Username */}
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{username}</h1>

          {/* Top title badge */}
          {topTitle ? (
            <div className="inline-flex items-center gap-1.5 bg-[#FFFF00] text-black px-3 py-1 rounded-full text-xs font-black">
              <span>👑</span>
              <span>{topTitle.name}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400">まだ称号がありません</p>
          )}

          {/* Follow button */}
          {showFollowButton && (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-sm font-black transition-colors disabled:opacity-60 ${
                isFollowing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-[#FFFF00] text-black hover:bg-yellow-400"
              }`}
            >
              {loading ? "処理中..." : isFollowing ? "✓ フォロー中" : "フォローする"}
            </button>
          )}

          {/* Stats — vertical cards */}
          <div className="w-full space-y-2 mt-2">
            {[
              { label: "総実食数", value: stats.totalReviews, unit: "杯" },
              { label: "制覇店舗数", value: stats.visitedStores, unit: "店" },
              { label: "総いいね数", value: stats.totalLikes, unit: "件" },
            ].map(({ label, value, unit }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <span
                  className="text-xl font-black text-black leading-none"
                  style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                >
                  {value}
                  <span className="text-xs font-bold text-gray-400 ml-0.5">{unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Follow / Follower counts */}
          <div className="w-full flex gap-4 justify-center border-t border-gray-100 pt-4">
            <div className="text-center">
              <p
                className="text-xl font-black text-black leading-none"
                style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
              >
                {followCounts.following}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">フォロー</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p
                className="text-xl font-black text-black leading-none"
                style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
              >
                {followerCount}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">フォロワー</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          RIGHT COLUMN — scrollable content
      ══════════════════════════════════════════ */}
      <div className="space-y-8 min-w-0">

        {/* ① My Jiro Identity */}
        <section>
          <SectionHeading>My Jiro Identity</SectionHeading>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {stats.totalReviews > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Radar chart */}
                <div className="flex flex-col items-center">
                  <RadarChart values={avgParams} size={220} />
                  <p className="text-xs text-gray-400 mt-2">
                    {stats.totalReviews}件のレビューの平均
                  </p>
                </div>
                {/* Sliders (readonly progress bars) */}
                <div className="space-y-4">
                  {paramLabels.map((label, i) => {
                    const value = avgParams[i] ?? 3;
                    const pct = ((value - 1) / 4) * 100;
                    return (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">{label}</span>
                          <span className="text-sm font-black text-gray-900">
                            {value.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FFFF00] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400">
                <p className="text-sm">まだレビューがありません</p>
              </div>
            )}
          </div>
        </section>

        {/* ② 獲得称号一覧 */}
        <section>
          <SectionHeading>獲得称号 ({titles.length})</SectionHeading>
          {titles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              <p className="text-sm">まだ称号がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {titles.slice(0, 6).map((t, i) => (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${
                    i === 0
                      ? "border-[#FFFF00] bg-yellow-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{i === 0 ? "👑" : "🏅"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ③ 実食カレンダー */}
        <section>
          <SectionHeading>実食カレンダー</SectionHeading>
          <div className="overflow-x-hidden">
            <CalendarView userId={userId} isOwner={currentUserId === userId} />
          </div>
        </section>

        {/* ④ レビュー履歴 */}
        <section>
          <SectionHeading>レビュー履歴</SectionHeading>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
              <p className="text-sm">まだレビューがありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/reviews/${r.id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#FFFF00] transition-all overflow-hidden block"
                >
                  {/* Thumbnail */}
                  {r.images && r.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.images[0]}
                      alt={r.storeName ?? "ラーメン"}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-4xl">
                      🍜
                    </div>
                  )}
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {r.storeName ?? "店舗不明"}
                    </p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3 h-3 ${
                            n <= r.rating
                              ? "fill-[#FFFF00] text-[#FFFF00]"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{r.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.eaten_at ?? r.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
