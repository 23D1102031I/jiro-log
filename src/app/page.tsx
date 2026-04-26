import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FAB } from "@/components/home/FAB";
import { TimelineClient } from "@/components/home/TimelineClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Star, Trophy } from "lucide-react";

type CallValue = "抜き" | "少なめ" | "標準" | "マシ" | "マシマシ";

interface ReviewUser {
  username: string | null;
  avatar_url: string | null;
}

interface ReviewStore {
  name: string | null;
  region: string | null;
}

interface Review {
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
}

interface StoreRanking {
  store_id: string;
  store_name: string;
  region: string;
  avg_rating: number;
  review_count: number;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold text-black mb-6">
      <span className="w-1 h-7 bg-[#FFFF00] rounded-full flex-shrink-0" />
      {children}
    </h2>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawReviews } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, images, created_at,
       call_garlic, call_yasai, call_abura, call_karame,
       store_id, user_id,
       users(username, avatar_url),
       stores(name, region)`
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const reviews: Review[] = (rawReviews ?? []).map((r) => ({
    id: r.id as string,
    rating: r.rating as number,
    comment: r.comment as string | null,
    images: r.images as string[] | null,
    created_at: r.created_at as string,
    call_garlic: r.call_garlic as CallValue | null,
    call_yasai: r.call_yasai as CallValue | null,
    call_abura: r.call_abura as CallValue | null,
    call_karame: r.call_karame as CallValue | null,
    users: Array.isArray(r.users) ? (r.users[0] as ReviewUser ?? null) : (r.users as ReviewUser | null),
    stores: Array.isArray(r.stores) ? (r.stores[0] as ReviewStore ?? null) : (r.stores as ReviewStore | null),
    store_id: r.store_id as string,
    user_id: r.user_id as string | null,
  }));

  // 店舗ランキング
  const { data: allReviewsRaw } = await supabase
    .from("reviews")
    .select("store_id, rating, stores(name, region)");

  const rankingMap = new Map<string, { store_name: string; region: string; total: number; count: number }>();
  (allReviewsRaw ?? []).forEach((r) => {
    const storeId = r.store_id as string;
    const rating = r.rating as number;
    const storeArr = r.stores;
    const storeInfo = Array.isArray(storeArr) ? storeArr[0] : storeArr;
    const storeName = (storeInfo as { name?: string } | null)?.name ?? "不明";
    const region = (storeInfo as { region?: string } | null)?.region ?? "";
    if (!rankingMap.has(storeId)) {
      rankingMap.set(storeId, { store_name: storeName, region, total: 0, count: 0 });
    }
    const entry = rankingMap.get(storeId)!;
    entry.total += rating;
    entry.count += 1;
  });

  const ranking: StoreRanking[] = Array.from(rankingMap.entries())
    .map(([store_id, v]) => ({
      store_id,
      store_name: v.store_name,
      region: v.region,
      avg_rating: v.count > 0 ? v.total / v.count : 0,
      review_count: v.count,
    }))
    .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    .slice(0, 5);

  // 店舗総数
  const { count: storeCount } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true });
  const totalStores = storeCount ?? 45;

  // ログインユーザーの訪問済み店舗数
  let visitedCount = 0;
  if (user) {
    const { data: visited } = await supabase
      .from("reviews")
      .select("store_id")
      .eq("user_id", user.id);
    visitedCount = new Set((visited ?? []).map((r) => r.store_id)).size;
  }

  // スタンプグリッドプレビュー用店舗
  const { data: previewStores } = await supabase
    .from("stores")
    .select("id, name, region")
    .limit(12);

  const heroReview = reviews[0];
  const heroImage = heroReview?.images?.[0] ?? null;
  const heroStoreName = heroReview?.stores?.name
    ? heroReview.stores.name.replace("ラーメン二郎 ", "").replace("ラーメン二郎", "")
    : "豚星";

  return (
    <>
      <Header />

      <main className="flex-1 bg-white">

        {/* ① ヒーローセクション */}
        <section className="relative bg-black overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-5 flex items-center justify-end pointer-events-none">
            <span
              className="text-[18rem] font-black text-white leading-none select-none"
              style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
            >
              二郎
            </span>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* 左: テキスト */}
              <div className="max-w-xl">
                <div className="w-12 h-1 bg-[#FFFF00] mb-4 rounded-full" />
                <h1
                  className="text-5xl sm:text-7xl font-black text-white leading-none mb-3"
                  style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                >
                  {heroReview ? `この神豚、\n${heroStoreName}。` : "この神豚、\n豚星。"}
                </h1>

                {heroReview ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-300 text-sm sm:text-base">
                      {heroReview.stores?.name ?? ""}
                      {heroReview.stores?.region && (
                        <span className="text-gray-400 text-sm ml-1">({heroReview.stores.region})</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-5 h-5 ${n <= Math.round(heroReview.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600 fill-gray-600"}`}
                          />
                        ))}
                      </span>
                      <span className="text-white font-bold">{Number(heroReview.rating).toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">by @{heroReview.users?.username ?? "匿名"}</span>
                    </div>
                    {heroReview.comment && (
                      <p className="text-gray-300 text-sm line-clamp-2 max-w-sm">{heroReview.comment}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-gray-300 text-sm sm:text-base">ジロリアンの記録帳。あなたの一杯を残そう。</p>
                    <p className="text-gray-400 text-sm mt-1">全国{totalStores}直系店舗のレビューを記録できます。</p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/post"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-colors"
                  >
                    ✏️ レビューを投稿する
                  </Link>
                  <Link
                    href="/stamp"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors"
                  >
                    👑 スタンプカードを見る
                  </Link>
                </div>
              </div>

              {/* 右: ヒーロー画像 */}
              {heroImage && (
                <div className="hidden lg:block">
                  <Link href={`/reviews/${heroReview.id}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square max-w-sm mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroImage}
                        alt={heroStoreName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-bold text-sm">{heroReview.stores?.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= heroReview.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-500"}`} />
                          ))}
                          <span className="text-white text-xs font-bold ml-1">{Number(heroReview.rating).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ② タイムライン */}
          <section className="py-8 md:py-12">
            <SectionTitle>最新レビュータイムライン</SectionTitle>
            <TimelineClient initialReviews={reviews} currentUserId={user?.id ?? null} />
          </section>

          {/* ③ 直系コンプリートへの道 */}
          <section className="py-8 md:py-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle>直系コンプリートへの道</SectionTitle>
              <Link
                href="/stamp"
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                スタンプカードを見る →
              </Link>
            </div>

            {/* 進捗 */}
            <div className="mb-6 p-5 rounded-2xl bg-black text-white flex items-center gap-6">
              <div className="flex-shrink-0 text-center">
                <div
                  className="text-5xl font-black text-[#FFFF00] leading-none"
                  style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                >
                  {visitedCount}
                  <span className="text-2xl text-gray-400">/{totalStores}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">店舗制覇</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">制覇率</span>
                  <span className="text-sm font-bold text-[#FFFF00]">
                    {totalStores > 0 ? Math.round((visitedCount / totalStores) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFFF00] rounded-full transition-all"
                    style={{ width: `${totalStores > 0 ? (visitedCount / totalStores) * 100 : 0}%` }}
                  />
                </div>
                {!user && (
                  <p className="text-xs text-gray-500 mt-2">ログインすると制覇数が記録されます</p>
                )}
              </div>
            </div>

            {/* 店舗グリッドプレビュー */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {(previewStores ?? []).map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  title={store.name}
                  className="aspect-square rounded-lg border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-1 text-center hover:border-[#FFFF00] transition-colors"
                >
                  <span className="text-base">🍜</span>
                </Link>
              ))}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-bold">…</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/stamp"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-[#FFFF00] font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                👑 スタンプカードを見る（全{totalStores}店舗）
              </Link>
            </div>
          </section>

          {/* ④ 店舗マッププレビュー */}
          <section className="py-8 md:py-12 border-t border-gray-100">
            <SectionTitle>店舗マップ</SectionTitle>
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-44 sm:h-56 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, #666, #666 1px, transparent 1px, transparent 40px),
                    repeating-linear-gradient(90deg, #666, #666 1px, transparent 1px, transparent 40px)
                  `
                }} />
                <div className="text-center z-10">
                  <div className="flex items-center gap-3 justify-center mb-3 text-4xl">
                    <span>📍</span><span>📍</span><span>📍</span>
                  </div>
                  <p className="text-gray-700 font-bold">全国{totalStores}店舗の位置を地図で確認</p>
                  <p className="text-gray-500 text-sm mt-1">訪問済み/未訪問でピンが色分けされます</p>
                </div>
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FFFF00] border border-black inline-block" />
                    訪問済み
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                    未訪問
                  </span>
                </div>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  店舗マップを開く
                </Link>
              </div>
            </div>
          </section>

          {/* ⑤ 店舗ランキング */}
          <section className="py-8 md:py-12 border-t border-gray-100">
            <SectionTitle>店舗ランキング</SectionTitle>

            <div className="space-y-3">
              {(ranking.length > 0
                ? ranking
                : [
                    { store_id: "1", store_name: "ラーメン二郎 三田本店", region: "23区", avg_rating: 4.8, review_count: 0 },
                    { store_id: "2", store_name: "ラーメン二郎 目黒店", region: "23区", avg_rating: 4.6, review_count: 0 },
                    { store_id: "3", store_name: "ラーメン二郎 京都店", region: "関西", avg_rating: 4.5, review_count: 0 },
                    { store_id: "4", store_name: "ラーメン二郎 仙川店", region: "多摩", avg_rating: 4.3, review_count: 0 },
                    { store_id: "5", store_name: "ラーメン二郎 立川店", region: "多摩", avg_rating: 4.1, review_count: 0 },
                  ]
              ).map((item, index) => (
                <div
                  key={item.store_id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <span
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-black text-sm"
                    style={{
                      fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif",
                      background: index < 3 ? "#FFFF00" : "#f3f4f6",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-black truncate">{item.store_name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {item.region}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {item.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">{item.review_count}件</span>
                  </div>
                </div>
              ))}
              {ranking.length === 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  ※ レビューデータがまだありません。モックデータを表示しています。
                </p>
              )}
            </div>

            {ranking.length > 0 && (
              <div className="mt-6 flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  ランキングは全レビューの平均評価で算出されます。レビューを投稿してランキングに参加しよう！
                </p>
              </div>
            )}
          </section>

        </div>
      </main>

      <FAB />
      <Footer />
    </>
  );
}
