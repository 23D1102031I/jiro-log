import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FAB } from "@/components/home/FAB";
import { TimelineClient } from "@/components/home/TimelineClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin } from "lucide-react";

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
  thickness_score: number | null;
  dero_score: number | null;
  vegetable_score: number | null;
  noodle_score: number | null;
  pork_score: number | null;
  emulsification_score: number | null;
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

  // メインレビュー取得（ミニパラメータバー用スコア追加）
  const { data: rawReviews } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, images, created_at,
       call_garlic, call_yasai, call_abura, call_karame,
       store_id, user_id,
       thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score,
       users(username, avatar_url),
       stores(name, region)`
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // ヒーロー用：前日いいね数最多レビュー（画像あり）→フォールバック: 最新画像あり
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const jstYesterday = new Date(jstNow);
  jstYesterday.setUTCDate(jstYesterday.getUTCDate() - 1);
  const ymd = jstYesterday.toISOString().slice(0, 10);
  const yesterdayStart = `${ymd}T00:00:00+09:00`;
  const yesterdayEnd   = `${ymd}T23:59:59+09:00`;

  const { data: yesterdayLikes } = await supabase
    .from("likes")
    .select("review_id")
    .gte("created_at", yesterdayStart)
    .lte("created_at", yesterdayEnd);

  // review_id ごとのいいね数を集計してトップを選ぶ
  const likeCounts: Record<string, number> = {};
  for (const { review_id } of yesterdayLikes ?? []) {
    if (review_id) likeCounts[review_id] = (likeCounts[review_id] ?? 0) + 1;
  }
  const topReviewIds = Object.entries(likeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  let rawHeroReview = null;
  if (topReviewIds.length > 0) {
    const { data: candidates } = await supabase
      .from("reviews")
      .select(`id, rating, images, store_id, stores(name, region)`)
      .in("id", topReviewIds.slice(0, 10));
    // いいね数順 & 画像ありで選択
    rawHeroReview = topReviewIds
      .map(id => (candidates ?? []).find(r => r.id === id))
      .find(r => r && Array.isArray(r.images) && (r.images as string[]).length > 0)
      ?? null;
  }
  // フォールバック: 最新画像あり
  if (!rawHeroReview) {
    const { data: fallback } = await supabase
      .from("reviews")
      .select(`id, rating, images, store_id, stores(name, region)`)
      .order("created_at", { ascending: false })
      .limit(20);
    rawHeroReview = (fallback ?? []).find(
      r => Array.isArray(r.images) && (r.images as string[]).length > 0
    ) ?? null;
  }

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
    thickness_score: r.thickness_score as number | null,
    dero_score: r.dero_score as number | null,
    vegetable_score: r.vegetable_score as number | null,
    noodle_score: r.noodle_score as number | null,
    pork_score: r.pork_score as number | null,
    emulsification_score: r.emulsification_score as number | null,
  }));

  // 全店舗（スタンプグリッド用）
  const { data: allStores } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  const totalStores = allStores?.length ?? 45;

  // ユーザーの訪問済み店舗IDセット（ログイン時）
  let visitedStoreIds = new Set<string>();
  let visitedCount = 0;
  if (user) {
    const { data: visitedReviews } = await supabase
      .from("reviews")
      .select("store_id")
      .eq("user_id", user.id);
    visitedStoreIds = new Set((visitedReviews ?? []).map(r => r.store_id as string));
    visitedCount = visitedStoreIds.size;
  }

  type HeroStore = { name: string | null; region: string | null };
  const heroReview = rawHeroReview
    ? {
        id: rawHeroReview.id as string,
        rating: rawHeroReview.rating as number,
        images: rawHeroReview.images as string[] | null,
        store_id: rawHeroReview.store_id as string,
        stores: (Array.isArray(rawHeroReview.stores)
          ? (rawHeroReview.stores[0] as HeroStore ?? null)
          : (rawHeroReview.stores as HeroStore | null)),
      }
    : null;
  const heroImage = heroReview?.images?.[0] ?? null;

  return (
    <>
      <Header />

      <main className="flex-1 bg-white">

        {/* ① ヒーローバナー（LP準拠：全幅画像＋左グラデーション＋テキストオーバーレイ） */}
        <section className="relative overflow-hidden">
          <div className="relative aspect-[16/7] md:aspect-[16/6] overflow-hidden bg-black">
            {/* 背景画像 */}
            {heroImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImage}
                alt={heroReview?.stores?.name ?? ""}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            )}
            {!heroImage && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 flex items-center justify-center">
                <span className="text-[12rem] font-black text-white/5 select-none"
                  style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}>
                  二郎
                </span>
              </div>
            )}
            {/* グラデーションオーバーレイ（左〜中央） */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

            {/* テキスト（左寄り） */}
            <div className="absolute inset-0 flex items-end pb-10 px-6 md:px-12 lg:px-20">
              <div className="max-w-lg">
                <div className="w-10 h-1 bg-[#FFFF00] mb-3 rounded-full" />
                {heroReview && (
                  <p className="text-white font-black text-2xl md:text-4xl mb-2 leading-tight drop-shadow">
                    {heroReview.stores?.name ?? ""}
                    <span className="text-[#FFFF00] text-lg md:text-2xl ml-3">★{Number(heroReview.rating).toFixed(1)}</span>
                  </p>
                )}
                <Link
                  href={heroReview ? `/reviews/${heroReview.id}` : "/post"}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFF00] text-black font-black text-sm rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  詳しく見る →
                </Link>
              </div>
            </div>

            {/* ドットインジケーター（下中央） */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFFF00]" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ② タイムライン */}
          <section className="py-10 md:py-14">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle>最新レビュータイムライン</SectionTitle>
            </div>
            <TimelineClient initialReviews={reviews} currentUserId={user?.id ?? null} />
          </section>

          {/* ③ 直系コンプリートへの道 */}
          <section className="py-10 md:py-14 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle>直系コンプリートへの道 <span className="text-sm font-medium text-gray-400">全{totalStores}店舗</span></SectionTitle>
              <Link
                href="/stamp"
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                スタンプカードを見る →
              </Link>
            </div>

            {/* 進捗バー */}
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

            {/* 全店舗グリッド（スタンプカード画面準拠デザイン） */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {(allStores ?? []).map((store) => {
                const visited = visitedStoreIds.has(store.id as string);
                return (
                  <Link
                    key={store.id as string}
                    href={`/stores/${store.id}`}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:opacity-80 ${
                      visited
                        ? "bg-[#FFFF00] border-black shadow-md"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 ${
                      visited
                        ? "bg-black border-black text-[#FFFF00]"
                        : "bg-white border-gray-300 text-gray-300"
                    }`}>
                      {visited ? "🍜" : "○"}
                    </div>
                    <p className={`text-xs font-bold leading-tight text-center line-clamp-2 ${
                      visited ? "text-black" : "text-gray-400"
                    }`}>
                      {(store.name as string).replace("ラーメン二郎 ", "")}
                    </p>
                    {visited && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-[#FFFF00] rounded-full flex items-center justify-center text-xs font-black">
                        ✓
                      </span>
                    )}
                  </Link>
                );
              })}
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

          {/* ④ 店舗マップ */}
          <section className="py-10 md:py-14 border-t border-gray-100">
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                  <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                  店舗マップ
                </h3>
              </div>
              <div className="relative h-40 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <p className="text-white/40 text-sm font-bold">全国{totalStores}店舗</p>
              </div>
              <div className="p-3">
                <Link
                  href="/map"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  店舗マップを開く →
                </Link>
              </div>
            </div>
          </section>

        </div>

        {/* ⑥ 投稿CTAバナー（フッター直前） */}
        <section className="bg-[#FFFF00] py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-black mb-2">
              レビューを投稿して、全国のジロリアンと繋がろう！
            </h2>
            <p className="text-black/60 text-sm mb-6">あなたの一杯を記録して、コミュニティに参加しよう</p>
            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-[#FFFF00] font-black text-lg rounded-xl hover:bg-gray-900 transition-colors"
            >
              レビューを投稿する →
            </Link>
          </div>
        </section>

      </main>

      <FAB />
      <Footer />
    </>
  );
}
