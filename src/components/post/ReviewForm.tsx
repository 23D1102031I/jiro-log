"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { containsNGWord } from "@/lib/ngwords";
import { evaluateAndAwardTitles } from "@/lib/titles";
import { ImageUploader, type ImageItem } from "./ImageUploader";
import { CallSelector, type CallOption } from "./CallSelector";
import { StarRating } from "./StarRating";
import { ParameterSliders, DEFAULT_PARAMS, type ParamKey, type ParamValues } from "./ParameterSliders";
import { TitleAward } from "./TitleAward";

interface Store {
  id: string;
  name: string;
  region: string;
}

interface AwardedTitle {
  name: string;
  description: string;
}

export function ReviewForm({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const [storeId, setStoreId] = useState("");
  const [eatenAt, setEatenAt] = useState<string>(today);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [callGarlic, setCallGarlic] = useState<CallOption>("標準");
  const [callYasai, setCallYasai] = useState<CallOption>("標準");
  const [callAbura, setCallAbura] = useState<CallOption>("標準");
  const [callKarame, setCallKarame] = useState<CallOption>("標準");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [params, setParams] = useState<ParamValues>(DEFAULT_PARAMS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleQueue, setTitleQueue] = useState<AwardedTitle[]>([]);

  const handleParamChange = useCallback((key: ParamKey, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeId) { setError("店舗を選択してください"); return; }
    if (rating === 0) { setError("総合評価を選んでください"); return; }
    if (comment && containsNGWord(comment)) {
      setError("コメントにNGワードが含まれています");
      showToast("NGワードが含まれています", "error");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/post"); return; }

      const imageUrls: string[] = [];
      for (const img of images) {
        const path = `${user.id}/${Date.now()}_${img.id}.jpg`;
        const { data: up, error: upErr } = await supabase.storage
          .from("review-images")
          .upload(path, img.blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage
          .from("review-images")
          .getPublicUrl(up.path);
        imageUrls.push(publicUrl);
      }

      const { error: insertErr } = await supabase.from("reviews").insert({
        store_id: storeId,
        user_id: user.id,
        rating,
        call_garlic: callGarlic,
        call_yasai: callYasai,
        call_abura: callAbura,
        call_karame: callKarame,
        comment: comment.trim() || null,
        images: imageUrls,
        eaten_at: eatenAt,
        ...params,
      });
      if (insertErr) throw insertErr;

      const awarded = await evaluateAndAwardTitles(user.id);

      if (awarded.length > 0) {
        setTitleQueue(awarded);
        return;
      }

      showToast("投稿が完了しました！", "success");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "投稿に失敗しました";
      setError(msg);
      showToast("投稿に失敗しました", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const callConfigs = [
    { key: "yasai", label: "ヤサイ", emoji: "🥬", value: callYasai, onChange: setCallYasai },
    { key: "garlic", label: "ニンニク", emoji: "🧄", value: callGarlic, onChange: setCallGarlic },
    { key: "abura", label: "アブラ", emoji: "🫙", value: callAbura, onChange: setCallAbura },
    { key: "karame", label: "カラメ", emoji: "🍜", value: callKarame, onChange: setCallKarame },
  ];

  const storesByRegion = stores.reduce<Record<string, Store[]>>((acc, s) => {
    (acc[s.region] = acc[s.region] ?? []).push(s);
    return acc;
  }, {});

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* 店舗選択 + 日付 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <section>
            <h2 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">1</span>
              店舗を選択
            </h2>
            <div className="relative">
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                required
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent bg-white"
              >
                <option value="">-- 店舗を選んでください --</option>
                {Object.entries(storesByRegion).sort().map(([region, regionStores]) => (
                  <optgroup key={region} label={region}>
                    {regionStores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">2</span>
              食べた日
            </h2>
            <input
              type="date"
              max={today}
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent"
            />
          </section>
        </div>

        {/* 2カラムメインエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* 左カラム: 画像 + コール + 評価 + コメント */}
          <div className="space-y-6">
            {/* 画像 */}
            <section>
              <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">3</span>
                ラーメン画像
                <span className="text-xs text-gray-400 font-normal">(任意)</span>
              </h2>
              <ImageUploader onChange={setImages} />
            </section>

            {/* コール */}
            <section>
              <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">4</span>
                コール
                <span className="text-xs text-gray-400 font-normal">(呪文)</span>
              </h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <CallSelector calls={callConfigs} />
              </div>
            </section>

            {/* 総合評価 */}
            <section>
              <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">5</span>
                総合評価
                <span className="text-xs text-red-500 font-normal">必須</span>
              </h2>
              <StarRating value={rating} onChange={setRating} />
            </section>

            {/* コメント */}
            <section>
              <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">6</span>
                コメント
                <span className="text-xs text-gray-400 font-normal">(任意)</span>
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={800}
                rows={5}
                placeholder="この一杯の感想や特徴、スープの味わい、豚の神がかり具合などを自由に記しましょう…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent resize-none"
              />
              <p className={`text-xs mt-1 text-right ${comment.length > 750 ? "text-orange-500" : "text-gray-400"}`}>
                {comment.length} / 800
              </p>
            </section>
          </div>

          {/* 右カラム: ジロリアンパラメータ */}
          <div>
            <section>
              <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">7</span>
                ジロリアンパラメータ
                <span className="text-xs text-gray-400 font-normal">(各1〜5段階評価)</span>
              </h2>
              <div className="bg-gray-50 rounded-xl p-5">
                <ParameterSliders values={params} onChange={handleParamChange} />
              </div>
            </section>
          </div>
        </div>

        {/* エラー */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 投稿ボタン */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-[#FFFF00] text-black font-black text-lg rounded-2xl hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              投稿中...
            </>
          ) : (
            <>
              <Pencil className="w-5 h-5" />
              この一杯を記録する
            </>
          )}
        </button>
      </form>

      {titleQueue.length > 0 && (
        <TitleAward
          title={titleQueue[0]}
          onClose={() => {
            const name = titleQueue[0].name;
            showToast(`称号「${name}」を獲得しました！`, "success");
            const rest = titleQueue.slice(1);
            if (rest.length > 0) {
              setTitleQueue(rest);
            } else {
              setTitleQueue([]);
              router.push("/");
              router.refresh();
            }
          }}
        />
      )}
    </>
  );
}
