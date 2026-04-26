"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CallValue = "抜き" | "少なめ" | "標準" | "マシ" | "マシマシ";

interface ReviewUser { username: string | null; avatar_url: string | null }
interface ReviewStore { name: string | null; region: string | null }

export interface TimelineReview {
  id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string;
  call_garlic: CallValue | null;
  call_yasai: CallValue | null;
  call_abura: CallValue | null;
  call_karame: CallValue | null;
  users: ReviewUser | null;
  stores: ReviewStore | null;
  store_id: string;
  user_id: string | null;
  thickness_score: number | null;
  dero_score: number | null;
  vegetable_score: number | null;
  noodle_score: number | null;
  pork_score: number | null;
  emulsification_score: number | null;
}

interface Props {
  initialReviews: TimelineReview[];
  currentUserId: string | null;
}

const INITIAL_SIZE = 5;
const PAGE_SIZE = 15;

function LikeButton({ reviewId, userId }: { reviewId: string; userId: string | null }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("likes")
      .select("id", { count: "exact" })
      .eq("review_id", reviewId)
      .then(({ count: c }) => setCount(c ?? 0));

    if (userId) {
      supabase
        .from("likes")
        .select("id")
        .eq("review_id", reviewId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [reviewId, userId]);

  const toggle = async () => {
    if (!userId || loading) return;
    setLoading(true);
    const supabase = createClient();
    if (liked) {
      await supabase.from("likes").delete().eq("review_id", reviewId).eq("user_id", userId);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({ review_id: reviewId, user_id: userId });
      setLiked(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={!userId}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
      className={`flex items-center gap-1 text-xs font-bold transition-all ${
        liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
      } disabled:opacity-40 disabled:cursor-default`}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
      <span>{count}</span>
    </button>
  );
}

function ReviewCard({ review, userId }: { review: TimelineReview; userId: string | null }) {
  const router = useRouter();
  const allCalls = [
    { label: "野菜", value: review.call_yasai },
    { label: "ニンニク", value: review.call_garlic },
    { label: "アブラ", value: review.call_abura },
    { label: "カラメ", value: review.call_karame },
  ];

  const miniParams = [
    { label: "麺太さ", value: review.thickness_score },
    { label: "デロさ", value: review.dero_score },
    { label: "ヤサイ", value: review.vegetable_score },
    { label: "麺量", value: review.noodle_score },
    { label: "神豚度", value: review.pork_score },
    { label: "乳化度", value: review.emulsification_score },
  ];

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex cursor-pointer"
      onClick={() => router.push(`/reviews/${review.id}`)}
    >
      {/* 左: サムネイル */}
      <div className="flex-shrink-0 w-36 sm:w-44 bg-gray-100">
        {review.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.images[0]} alt="" className="w-full h-full object-cover" style={{ minHeight: "144px" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ minHeight: "144px" }}>🍜</div>
        )}
      </div>

      {/* 右: コンテンツ */}
      <div className="flex-1 p-3 sm:p-4 min-w-0 flex flex-col gap-1.5">
        {/* 店舗名 + 評価 */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/stores/${review.store_id}`}
            onClick={stop}
            className="font-black text-sm sm:text-base text-gray-900 hover:underline leading-tight"
          >
            {review.stores?.name ?? "—"}
          </Link>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`} />
            ))}
            <span className="text-sm font-black ml-1 text-gray-800">{Number(review.rating).toFixed(1)}</span>
          </div>
        </div>

        {/* コール */}
        <div className="flex gap-1 flex-wrap">
          {allCalls.map(({ label, value }) => {
            const isHigh = value && ["マシ", "マシマシ"].includes(value);
            return (
              <span
                key={label}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                  isHigh ? "bg-[#FFFF00] text-black border-black" : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                {label}: {value ?? "標準"}
              </span>
            );
          })}
        </div>

        {/* コメントプレビュー */}
        {review.comment && (
          <div className="bg-gray-50 rounded-lg px-2.5 py-2 border-l-2 border-[#FFFF00]">
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{review.comment}</p>
          </div>
        )}

        {/* ミニパラメータ */}
        <div className="hidden sm:grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
          {miniParams.map(({ label, value }) => {
            const v = Math.max(1, Math.min(5, value ?? 1));
            const pct = ((v - 1) / 4) * 100;
            return (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-10 shrink-0">{label}</span>
                <div className="relative flex-1 h-0.5 bg-gray-200 my-2">
                  <div
                    className="absolute w-3 h-3 bg-[#FFFF00] rounded-full border border-gray-400 -top-[5px] -translate-x-1/2 shadow"
                    style={{ left: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-700 w-3 text-right">{v}</span>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-gray-50">
          {review.user_id ? (
            <Link href={`/users/${review.user_id}`} onClick={stop} className="flex items-center gap-1.5 hover:opacity-80">
              {review.users?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.users.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                  {review.users?.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="text-xs text-gray-400">@{review.users?.username ?? "—"}</span>
            </Link>
          ) : (
            <span className="text-xs text-gray-400">@{review.users?.username ?? "—"}</span>
          )}
          <div className="flex items-center gap-2" onClick={stop}>
            <LikeButton reviewId={review.id} userId={userId} />
            <span className="text-xs text-gray-300">
              {new Date(review.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimelineClient({ initialReviews, currentUserId }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");
  const [reviews, setReviews] = useState<TimelineReview[]>(initialReviews);
  const [hasMore, setHasMore] = useState(initialReviews.length >= INITIAL_SIZE);
  const [loading, setLoading] = useState(false);
  const [emptyFollowing, setEmptyFollowing] = useState(false);
  const offsetRef = useRef(initialReviews.length);

  const mapReview = (r: Record<string, unknown>): TimelineReview => ({
    id: r.id as string,
    rating: r.rating as number,
    comment: r.comment as string | null ?? null,
    images: r.images as string[] | null ?? null,
    created_at: r.created_at as string,
    call_garlic: r.call_garlic as CallValue | null ?? null,
    call_yasai: r.call_yasai as CallValue | null ?? null,
    call_abura: r.call_abura as CallValue | null ?? null,
    call_karame: r.call_karame as CallValue | null ?? null,
    users: Array.isArray(r.users) ? (r.users as ReviewUser[])[0] ?? null : r.users as ReviewUser | null,
    stores: Array.isArray(r.stores) ? (r.stores as ReviewStore[])[0] ?? null : r.stores as ReviewStore | null,
    store_id: r.store_id as string,
    user_id: r.user_id as string | null ?? null,
    thickness_score: r.thickness_score as number | null ?? null,
    dero_score: r.dero_score as number | null ?? null,
    vegetable_score: r.vegetable_score as number | null ?? null,
    noodle_score: r.noodle_score as number | null ?? null,
    pork_score: r.pork_score as number | null ?? null,
    emulsification_score: r.emulsification_score as number | null ?? null,
  });

  const SELECT_FIELDS =
    "id, rating, comment, images, created_at, call_garlic, call_yasai, call_abura, call_karame, store_id, user_id, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, users(username, avatar_url), stores(name, region)";

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const supabase = createClient();

    let baseQuery = supabase
      .from("reviews")
      .select(SELECT_FIELDS)
      .order("created_at", { ascending: false })
      .range(offsetRef.current, offsetRef.current + PAGE_SIZE - 1);

    if (activeTab === "following" && currentUserId) {
      const { data: followsData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);
      const followingIds = followsData?.map((f: { following_id: string }) => f.following_id) ?? [];
      if (followingIds.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      baseQuery = baseQuery.in("user_id", followingIds);
    }

    const { data } = await baseQuery;

    if (!data || data.length === 0) {
      setHasMore(false);
    } else {
      const mapped = data.map((r) => mapReview(r as Record<string, unknown>));
      setReviews((prev) => [...prev, ...mapped]);
      offsetRef.current += mapped.length;
      if (mapped.length < PAGE_SIZE) setHasMore(false);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, activeTab, currentUserId]);

  const switchTab = useCallback(async (tab: "all" | "following") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setReviews([]);
    setHasMore(true);
    setEmptyFollowing(false);
    offsetRef.current = 0;

    setLoading(true);
    const supabase = createClient();

    let baseQuery = supabase
      .from("reviews")
      .select(SELECT_FIELDS)
      .order("created_at", { ascending: false })
      .range(0, INITIAL_SIZE - 1);

    if (tab === "following" && currentUserId) {
      const { data: followsData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);
      const followingIds = followsData?.map((f: { following_id: string }) => f.following_id) ?? [];
      if (followingIds.length === 0) {
        setEmptyFollowing(true);
        setHasMore(false);
        setLoading(false);
        return;
      }
      baseQuery = baseQuery.in("user_id", followingIds);
    }

    const { data } = await baseQuery;
    if (!data || data.length === 0) {
      setHasMore(false);
    } else {
      const mapped = data.map((r) => mapReview(r as Record<string, unknown>));
      setReviews(mapped);
      offsetRef.current = mapped.length;
      if (mapped.length < INITIAL_SIZE) setHasMore(false);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUserId]);

  return (
    <>
      {/* タブ */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        <button
          onClick={() => switchTab("all")}
          className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
            activeTab === "all"
              ? "border-[#FFFF00] text-black"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          すべての最新
        </button>
        {currentUserId && (
          <button
            onClick={() => switchTab("following")}
            className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
              activeTab === "following"
                ? "border-[#FFFF00] text-black"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            フォロー中
          </button>
        )}
      </div>

      {/* フォロー中タブで未フォロー */}
      {activeTab === "following" && emptyFollowing && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">👥</span>
          <p className="text-gray-500 font-medium text-lg mb-2">フォロー中のユーザーがいません</p>
          <p className="text-gray-400 text-sm mb-6">気になるジロリアンをフォローしてタイムラインを充実させよう！</p>
        </div>
      )}

      {/* レビューなし */}
      {!emptyFollowing && reviews.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🍜</span>
          <p className="text-gray-500 font-medium text-lg mb-2">まだレビューがありません</p>
          <p className="text-gray-400 text-sm mb-6">最初の一杯を記録しよう！</p>
          <Link
            href="/post"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-colors"
          >
            ✏️ レビューを投稿する
          </Link>
        </div>
      )}

      {/* リスト */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} userId={currentUserId} />
          ))}
        </div>
      )}

      {/* もっと見るボタン */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black font-bold text-sm rounded-xl hover:bg-black hover:text-[#FFFF00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />読み込み中…</>
            ) : (
              <>もっと見る（+{PAGE_SIZE}件）</>
            )}
          </button>
        </div>
      )}
      {!hasMore && reviews.length > INITIAL_SIZE && (
        <p className="text-center text-xs text-gray-400 py-4 mt-2">すべてのレビューを表示しました</p>
      )}
    </>
  );
}
