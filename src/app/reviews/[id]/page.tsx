import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { RadarChart } from "@/components/mypage/RadarChart";
import { ReviewDetailActions } from "@/components/review/ReviewDetailActions";
import { Star, Heart } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating, comment, stores(name)")
    .eq("id", id)
    .single();

  if (!data) return { title: "レビュー | Jiro Log" };

  const storeName =
    Array.isArray(data.stores) ? (data.stores[0] as { name: string })?.name : (data.stores as { name: string } | null)?.name;

  return {
    title: `${storeName ?? "店舗"} ★${data.rating} | Jiro Log`,
    description: data.comment ?? `${storeName}のレビュー`,
    openGraph: {
      title: `${storeName} ★${data.rating} | Jiro Log`,
      description: data.comment ?? `${storeName}のラーメン二郎レビュー`,
    },
  };
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: review }, { data: { user: authUser } }] = await Promise.all([
    supabase
      .from("reviews")
      .select(
        "id, rating, comment, images, created_at, eaten_at, store_id, call_garlic, call_yasai, call_abura, call_karame, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, users(id, username, avatar_url), stores(id, name, address)"
      )
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!review) notFound();

  type JoinedField<T> = T | T[] | null;
  const getField = <T,>(f: JoinedField<T>): T | null =>
    Array.isArray(f) ? (f[0] ?? null) : f;

  const user = getField(review.users) as { id: string; username: string; avatar_url: string | null } | null;
  const store = getField(review.stores) as { id: string; name: string; address: string } | null;

  // 並行取得: 最高位称号・同ユーザーの他レビュー3件・いいね数
  const [topTitleResult, userOtherReviewsResult, likeResult] = await Promise.all([
    user?.id
      ? supabase.from("user_titles").select("titles(name)").eq("user_id", user.id).order("achieved_at", { ascending: false }).limit(1).single()
      : Promise.resolve({ data: null, error: null }),
    user?.id
      ? supabase.from("reviews").select("id, rating, images, stores(name)").eq("user_id", user.id).neq("id", id).order("created_at", { ascending: false }).limit(3)
      : Promise.resolve({ data: null, error: null }),
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("review_id", id),
  ]);

  const topTitleData = topTitleResult.data;
  const topTitle = topTitleData
    ? (Array.isArray(topTitleData.titles) ? topTitleData.titles[0] : topTitleData.titles) as { name: string } | null
    : null;

  const userOtherReviews = userOtherReviewsResult.data;
  const likeCount = likeResult.count ?? 0;

  const CALL_LABELS = [
    { label: "ヤサイ", value: review.call_yasai },
    { label: "ニンニク", value: review.call_garlic },
    { label: "アブラ", value: review.call_abura },
    { label: "カラメ", value: review.call_karame },
  ];

  const radarValues = [
    review.thickness_score ?? 3,
    review.dero_score ?? 3,
    review.vegetable_score ?? 3,
    review.noodle_score ?? 3,
    review.pork_score ?? 3,
    review.emulsification_score ?? 3,
  ];

  const PARAMS = [
    { label: "麺の太さ", value: review.thickness_score },
    { label: "デロさ", value: review.dero_score },
    { label: "野菜量", value: review.vegetable_score },
    { label: "麺量", value: review.noodle_score },
    { label: "神豚度", value: review.pork_score },
    { label: "乳化度", value: review.emulsification_score },
  ];

  const shareUrl = `https://jiro-log.vercel.app/reviews/${id}`;
  const shareText = `${store?.name ?? "二郎"} ★${review.rating} | Jiro Log`;

  // eaten_at があればそちらを優先、なければ created_at を使用
  const displayDate = new Date(review.eaten_at ?? review.created_at).toLocaleDateString("ja-JP");

  const [firstImage, ...restImages] = (review.images ?? []) as string[];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">

          {/* ===== 左カラム ===== */}
          <div className="space-y-4">

            {/* 投稿者カード */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {user?.id ? (
                <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-black text-gray-500 border-2 border-gray-100">
                      {user.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.username}</p>
                    {topTitle && (
                      <span className="inline-flex items-center gap-1 bg-[#FFFF00] text-black px-2 py-0.5 rounded-full text-xs font-black">
                        👑 {topTitle.name}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-black text-gray-500">
                    ?
                  </div>
                  <p className="text-sm font-bold text-gray-600">{user?.username ?? "ユーザー"}</p>
                </div>
              )}
            </div>

            {/* 店舗情報カード */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {store?.id ? (
                    <Link href={`/stores/${store.id}`} className="hover:opacity-80 transition-opacity">
                      <h1 className="text-lg font-black text-gray-900 hover:underline">{store.name}</h1>
                    </Link>
                  ) : (
                    <h1 className="text-lg font-black text-gray-900">{store?.name}</h1>
                  )}
                  {store?.address && (
                    <p className="text-xs text-gray-400 mt-0.5">{store.address}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{displayDate}</span>
              </div>
            </div>

            {/* 大画像 */}
            {firstImage && (
              <div className="space-y-2">
                {/* 1枚目: aspect-video 全幅 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={firstImage} alt="" className="rounded-2xl w-full aspect-video object-cover" />
                {/* 2枚目以降: 小サムネイル4列 */}
                {restImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {restImages.map((url: string, i: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="rounded-xl w-full aspect-square object-cover" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 総合評価 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">総合評価</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className={`w-6 h-6 ${n <= review.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-2xl font-black">{Number(review.rating).toFixed(1)}</span>
              </div>
            </div>

            {/* コール */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">コール</p>
              <div className="flex flex-wrap gap-2">
                {CALL_LABELS.map(({ label, value }) => (
                  <span
                    key={label}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      value && ["マシ","マシマシ"].includes(value)
                        ? "bg-[#FFFF00] text-black border-black"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {label}: {value ?? "標準"}
                  </span>
                ))}
              </div>
            </div>

            {/* コメント */}
            {review.comment && (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">コメント</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
              </div>
            )}

            {/* いいね数表示（静的） */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              <span className="text-sm font-bold text-gray-700">{likeCount} いいね</span>
            </div>

          </div>

          {/* ===== 右カラム（sticky） ===== */}
          <div className="lg:sticky lg:top-20 space-y-4">

            {/* このジロリアンのパラメータ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">このジロリアンのパラメータ</p>
              <div className="flex justify-center mb-3">
                <RadarChart values={radarValues} size={200} />
              </div>
              <div className="space-y-2">
                {PARAMS.map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs text-gray-600">{label}</span>
                      <span className="text-xs font-bold text-gray-900">{value ?? 0}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#FFFF00]"
                        style={{ width: `${((value ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* このレビューへのアクション */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">このレビューへのアクション</p>
              <ReviewDetailActions
                reviewId={id}
                userId={authUser?.id ?? null}
                reviewOwnerId={user?.id ?? null}
                shareUrl={shareUrl}
                shareText={shareText}
              />
            </div>

            {/* このユーザーの他のレビュー */}
            {userOtherReviews && userOtherReviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">このユーザーの他のレビュー</p>
                <div className="grid grid-cols-3 gap-2">
                  {userOtherReviews.map((r) => {
                    const rStore = Array.isArray(r.stores) ? r.stores[0] : r.stores as { name: string } | null;
                    return (
                      <Link key={r.id} href={`/reviews/${r.id}`} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                          {r.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map((n) => (
                                <Star key={n} className={`w-2 h-2 ${n <= r.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-500"}`} />
                              ))}
                            </div>
                            {rStore?.name && (
                              <p className="text-white text-[10px] font-bold truncate">{rStore.name}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {user?.id && (
                  <Link
                    href={`/users/${user.id}`}
                    className="mt-3 block text-center text-xs font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    このユーザーのすべてのレビューを見る →
                  </Link>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
