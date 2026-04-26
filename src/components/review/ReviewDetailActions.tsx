"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { revokeInvalidTitles } from "@/lib/titles";

interface Props {
  reviewId: string;
  userId: string | null;
  reviewOwnerId: string | null;
  shareUrl: string;
  shareText: string;
}

export function ReviewDetailActions({ reviewId, userId, reviewOwnerId, shareUrl, shareText }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!userId && userId === reviewOwnerId;

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
    if (!userId || likeLoading) return;
    setLikeLoading(true);
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
    setLikeLoading(false);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;

      const revoked = await revokeInvalidTitles(userId!);
      for (const title of revoked) {
        showToast(`称号「${title.name}」が剥奪されました`, "error");
      }

      showToast("レビューを削除しました", "info");
      router.push("/");
      router.refresh();
    } catch {
      showToast("削除に失敗しました", "error");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
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

        {isOwner && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 justify-center py-2.5 text-sm font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            このレビューを削除する
          </button>
        )}
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black">レビューを削除</h2>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 space-y-1">
              <p>このレビューを削除します。この操作は取り消せません。</p>
              <p className="text-red-500 font-medium mt-1">条件を満たさなくなった称号は剥奪されます。</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
