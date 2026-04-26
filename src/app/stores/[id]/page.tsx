import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { RadarChart } from "@/components/mypage/RadarChart";
import { WeeklyHoursPanel } from "@/components/stores/WeeklyHoursPanel";
import type { WeeklyHours } from "@/components/stores/WeeklyHoursPanel";
import { MapPin, Clock, Star } from "lucide-react";

const PARAM_LABELS = [
  { label: "麺の太さ" },
  { label: "麺のデロさ" },
  { label: "ヤサイ量" },
  { label: "麺量" },
  { label: "神豚度" },
  { label: "乳化度" },
];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("stores").select("name, region").eq("id", id).single();
  if (!data) return { title: "店舗詳細 | Jiro Log" };
  return {
    title: `${data.name} | Jiro Log`,
    description: `${data.name}（${data.region}）のラーメン二郎レビュー`,
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, address, region, business_hours, closed_days, tags, weekly_hours")
    .eq("id", id)
    .single();

  if (!store) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, images, created_at, call_garlic, call_yasai, call_abura, call_karame, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, users(id, username, avatar_url)"
    )
    .eq("store_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const reviewList = reviews ?? [];
  const totalReviews = reviewList.length;

  // 最新レビュー画像を取得（メインビジュアル用）
  const latestReviewImage = (reviewList[0]?.images as string[] | null | undefined)?.[0] as string | undefined ?? null;

  type ParamKey =
    | "thickness_score"
    | "dero_score"
    | "vegetable_score"
    | "noodle_score"
    | "pork_score"
    | "emulsification_score";

  const paramKeys: ParamKey[] = [
    "thickness_score", "dero_score", "vegetable_score",
    "noodle_score", "pork_score", "emulsification_score",
  ];

  type ReviewRow = typeof reviewList[number];

  const avgParams =
    totalReviews > 0
      ? paramKeys.map((k) => {
          const vals = reviewList
            .map((r: ReviewRow) => (r as unknown as Record<string, unknown>)[k])
            .filter((v): v is number => typeof v === "number");
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;
        })
      : [3, 3, 3, 3, 3, 3];

  const avgRating =
    totalReviews > 0
      ? reviewList.reduce((a, r) => a + (r.rating ?? 0), 0) / totalReviews
      : 0;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-16">

        {/* ① 上部セクション（2カラム） */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
            {/* 左: メイン画像 */}
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
              {latestReviewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={latestReviewImage} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍜</div>
              )}
            </div>

            {/* 右: 店舗情報 */}
            <div className="flex flex-col justify-center">
              {/* 地域バッジ */}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 mb-2">
                <MapPin className="w-3 h-3" /> {store.region}
              </span>

              {/* 店舗名（大きく） */}
              <h1 className="text-3xl font-black text-gray-900 mb-1">{store.name}</h1>
              {store.address && <p className="text-sm text-gray-400 mb-3">{store.address}</p>}

              {/* 曜日別営業時間 */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">営業時間</span>
                </div>
                {store.weekly_hours ? (
                  <WeeklyHoursPanel weeklyHours={store.weekly_hours as WeeklyHours} />
                ) : store.closed_days ? (
                  <p className="text-sm text-gray-500">定休日: {store.closed_days}</p>
                ) : null}
              </div>

              {/* 評価 + OPENバッジ */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-5 h-5 ${n <= Math.round(avgRating) ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`} />
                  ))}
                  <span className="text-xl font-black ml-1">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
                </div>
              </div>

              {/* アクションボタン3つ */}
              <div className="flex flex-wrap gap-2">
                <Link href="/post" className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-colors">
                  ✏️ レビューを投稿
                </Link>
                <a href="#reviews" className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-700 transition-colors">
                  📋 レビューを見る
                </a>
                <Link href="/map" className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:border-gray-400 transition-colors">
                  🗺️ 地図を見る
                </Link>
              </div>

              {/* タグ */}
              {store.tags && (store.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {(store.tags as string[]).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFFF00] text-black">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ② 中部セクション（My Jiro Identity: RadarChart + パラメータバー） */}
        <section className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#FFFF00] inline-block" />
            My Jiro Identity
            {totalReviews > 0 && <span className="text-gray-400 font-normal normal-case ml-1">（{totalReviews}件の平均）</span>}
          </h2>

          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* 左: RadarChart */}
              <div className="flex justify-center">
                <RadarChart values={avgParams} size={240} />
              </div>
              {/* 右: パラメータバー */}
              <div className="space-y-3">
                {PARAM_LABELS.map(({ label }, i) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-black text-gray-900">{avgParams[i].toFixed(1)}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-[#FFFF00]" style={{ width: `${(avgParams[i] / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">まだレビューがありません</div>
          )}
        </section>

        {/* ③ 下部セクション（レビュー一覧 - PC4列グリッド） */}
        <section id="reviews" className="mb-8">
          <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FFFF00] inline-block" />
            レビュー ({totalReviews})
          </h2>

          {reviewList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
              まだレビューがありません
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reviewList.map((review) => {
                // reviewUser 取得
                const reviewUser = Array.isArray(review.users) ? (review.users[0] ?? null) : review.users;

                return (
                  <Link key={review.id} href={`/reviews/${review.id}`} className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* サムネイル */}
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {(review.images as string[] | null | undefined)?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={(review.images as string[])[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>
                      )}
                    </div>
                    {/* カード本文 */}
                    <div className="p-3">
                      {/* 評価 */}
                      <div className="flex items-center gap-1 mb-1.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= review.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`} />
                        ))}
                        <span className="text-xs font-bold ml-0.5">{Number(review.rating).toFixed(1)}</span>
                      </div>
                      {/* ユーザー */}
                      <div className="flex items-center gap-1.5">
                        {(reviewUser as {avatar_url?: string | null; username?: string} | null)?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(reviewUser as {avatar_url: string}).avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                            {((reviewUser as {username?: string} | null)?.username?.[0] ?? "?").toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 truncate">{(reviewUser as {username?: string} | null)?.username ?? "匿名"}</span>
                      </div>
                      {/* コメント */}
                      {review.comment && (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </>
  );
}
