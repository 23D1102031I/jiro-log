"use client";

import { useState, useEffect } from "react";
import { Heart, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  reviewId: string;
  userId: string | null;
  shareUrl: string;
  shareText: string;
}

export function ReviewDetailActions({ reviewId, userId, shareUrl, shareText }: Props) {
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
    <div className="flex gap-3">
      <button
        onClick={toggle}
        disabled={!userId}
        aria-label={liked ? "いいねを取り消す" : "いいねする"}
        className={`flex items-center gap-2 flex-1 justify-center py-3 rounded-xl font-bold text-sm border-2 transition-all ${
          liked
            ? "bg-red-50 border-red-300 text-red-500"
            : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
        } disabled:opacity-40 disabled:cursor-default`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        <span>{count} いいね</span>
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 flex-1 justify-center py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-900 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Xでシェア
      </a>
    </div>
  );
}
