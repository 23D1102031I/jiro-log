"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

interface Props {
  onClose: () => void;
}

export function DeleteAccountModal({ onClose }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const canDelete = confirm === "退会する";

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete user record (cascade deletes reviews, titles, etc. via RLS)
      const { error } = await supabase.from("users").delete().eq("id", user.id);
      if (error) throw error;

      await supabase.auth.signOut();
      showToast("退会しました。ご利用ありがとうございました。", "info");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      showToast("退会処理に失敗しました", "error");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black">退会の確認</h2>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 space-y-1">
          <p className="font-bold">以下のデータが完全に削除されます：</p>
          <ul className="list-disc list-inside space-y-0.5 text-red-600">
            <li>すべてのレビュー</li>
            <li>獲得称号</li>
            <li>アカウント情報</li>
          </ul>
          <p className="text-red-500 mt-2 font-medium">この操作は取り消せません。</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            確認のため「退会する」と入力してください
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="退会する"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "退会する"}
          </button>
        </div>
      </div>
    </div>
  );
}
