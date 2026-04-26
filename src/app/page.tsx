import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FAB } from "@/components/home/FAB";
import { TimelineClient } from "@/components/home/TimelineClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Star, Trophy, Medal } from "lucide-react";

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

interface StoreRanking {
  store_id: string;
  store_name: string;
  region: string;
  avg_rating: number;
  review_count: number;
}

const JIRO_RULES = [
  { icon: "🍜", text: "着席後にコールを聞かれたら答える" },
  { icon: "🧄", text: "コール例：「ニンニク入れますか？」→「ニンニク、ヤサイ」" },
  { icon: "🤫", text: "店内での会話は最小限に" },
  { icon: "🍽️", text: "食べきれる量を注文する" },
  { icon: "🚮", text: "食後は器を返却口へ" },
];

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
    thickness_score: r.thickness_score as number | null,
    dero_score: r.dero_score as number | null,
    vegetable_score: r.vegetable_score as number | null,
    noodle_score: r.noodle_score as number | null,
    pork_score: r.pork_score as number | null,
    emulsification_score: r.emulsification_score as number | null,
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

  // 最新の称号獲得者（直近5件）
  const { data: recentTitles } = await supabase
    .from("user_titles")
    .select("achieved_at, users(id, username, avatar_url), titles(name, description)")
    .order("achieved_at", { ascending: false })
    .limit(5);

  const titlesForDisplay = (recentTitles ?? []).map(t => {
    const u = Array.isArray(t.users) ? t.users[0] : t.users as {id: string; username: string; avatar_url: string | null} | null;
    const ti = Array.isArray(t.titles) ? t.titles[0] : t.titles as {name: string} | null;
    return {
      userId: (u as {id?: string} | null)?.id,
      username: (u as {username?: string} | null)?.username,
      avatarUrl: (u as {avatar_url?: string | null} | null)?.avatar_url,
      titleName: (ti as {name?: string} | null)?.name,
      achievedAt: t.achieved_at as string,
    };
  });

  // 人気の称号（獲得数TOP5）
  const { data: popularTitlesRaw } = await supabase
    .from("user_titles")
    .select("title_id, titles(name, description)");

  const titleCountMap = new Map<string, {name: string; count: number}>();
  (popularTitlesRaw ?? []).forEach(t => {
    const ti = Array.isArray(t.titles) ? t.titles[0] : t.titles as {name: string} | null;
    if (!(ti as {name?: string} | null)?.name || !t.title_id) return;
    const key = t.title_id as string;
    titleCountMap.set(key, {
      name: (ti as {name: string}).name,
      count: (titleCountMap.get(key)?.count ?? 0) + 1,
    });
  });
  const popularTitles = Array.from(titleCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const heroReview = reviews[0];
  const heroImage = heroReview?.images?.[0] ?? null;
  const heroStoreName = heroReview?.stores?.name
    ? heroReview.stores.name.replace("ラーメン二郎 ", "").replace("ラーメン二郎", "")
    : "豚星";

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
                alt={heroStoreName}
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
            <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-20">
              <div className="max-w-lg">
                <div className="w-10 h-1 bg-[#FFFF00] mb-3 rounded-full" />
                <h1
                  className="text-4xl md:text-6xl font-black text-white leading-tight"
                  style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                >
                  この神豚、{" "}
                  <br />
                  {heroStoreName}。
                </h1>
                {heroReview && (
                  <p className="text-gray-200 text-sm mt-2">
                    {heroReview.stores?.name ?? ""}
                    {" "}
                    <span className="text-[#FFFF00] font-bold">★{Number(heroReview.rating).toFixed(1)}</span>
                  </p>
                )}
                <Link
                  href={heroReview ? `/reviews/${heroReview.id}` : "/post"}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFF00] text-black font-black text-sm rounded-lg hover:bg-yellow-300 transition-colors"
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
              <Link
                href="/stamp"
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                すべて見る →
              </Link>
            </div>
            <TimelineClient initialReviews={reviews} currentUserId={user?.id ?? null} />
          </section>

          {/* ③ 直系コンプリートへの道 */}
          <section className="py-10 md:py-14 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle>直系コンプリートへの道</SectionTitle>
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

            {/* 全店舗グリッド（8列） */}
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
              {(allStores ?? []).map((store) => {
                const visited = visitedStoreIds.has(store.id as string);
                return (
                  <Link
                    key={store.id as string}
                    href={`/stores/${store.id}`}
                    title={store.name as string}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-lg transition-all hover:scale-110 ${
                      visited
                        ? "bg-[#FFFF00] border-black"
                        : "bg-gray-50 border-gray-200 opacity-50"
                    }`}
                  >
                    🍜
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

          {/* ④ 中段3カラム */}
          <section className="py-10 md:py-14 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 店舗マップ */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                    <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                    店舗マップ
                  </h3>
                </div>
                <div className="relative h-40 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, #666, #666 1px, transparent 1px, transparent 30px),
                      repeating-linear-gradient(90deg, #666, #666 1px, transparent 1px, transparent 30px)
                    `
                  }} />
                  <div className="text-center z-10">
                    <div className="flex items-center gap-2 justify-center mb-2 text-3xl">
                      <span>📍</span><span>📍</span><span>📍</span>
                    </div>
                    <p className="text-gray-700 text-xs font-bold">全国{totalStores}店舗</p>
                  </div>
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

              {/* 近くの直系店舗 */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                    <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                    近くの直系店舗
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {ranking.slice(0, 3).map((store) => (
                      <Link
                        key={store.store_id}
                        href={`/stores/${store.store_id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#FFFF00] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{store.store_name}</p>
                          <p className="text-xs text-gray-400">{store.region}</p>
                        </div>
                        <Star className="w-3 h-3 fill-[#FFFF00] text-[#FFFF00] flex-shrink-0" />
                        <span className="text-xs font-bold">{store.avg_rating.toFixed(1)}</span>
                      </Link>
                    ))}
                    {ranking.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">データがありません</p>
                    )}
                  </div>
                  <Link
                    href="/map"
                    className="block text-center text-xs font-bold text-gray-500 hover:text-black pt-3 transition-colors"
                  >
                    店舗マップを開く →
                  </Link>
                </div>
              </div>

              {/* 二郎ルール【基本】 */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                    <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                    二郎ルール【基本】
                  </h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2.5">
                    {JIRO_RULES.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-base flex-shrink-0">{rule.icon}</span>
                        <span className="text-xs text-gray-600 leading-relaxed">{rule.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ⑤ 下段3カラム */}
          <section className="py-10 md:py-14 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 店舗ランキングTOP5 */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                    <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                    店舗ランキング
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
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
                      <Link
                        key={item.store_id}
                        href={`/stores/${item.store_id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span
                          className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full font-black text-xs"
                          style={{
                            fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif",
                            background: index < 3 ? "#FFFF00" : "#f3f4f6",
                          }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-black truncate">{item.store_name}</p>
                          <p className="text-[10px] text-gray-400">{item.region}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Star className="w-3 h-3 fill-[#FFFF00] text-[#FFFF00]" />
                          <span className="text-xs font-bold">{item.avg_rating.toFixed(1)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {ranking.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                      <p className="text-[10px] text-yellow-800">
                        平均評価で算出
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 最新の称号獲得者 */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                    <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                    最新の称号獲得者
                  </h3>
                </div>
                <div className="p-4">
                  {titlesForDisplay.length > 0 ? (
                    <div className="space-y-3">
                      {titlesForDisplay.map((t, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          {t.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.avatarUrl}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs flex-shrink-0">
                              {t.username?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">@{t.username ?? "匿名"}</p>
                            <p className="text-[10px] text-gray-500 truncate">「{t.titleName ?? "—"}」を獲得</p>
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {t.achievedAt ? new Date(t.achievedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }) : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Medal className="w-8 h-8 text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">まだ称号獲得者はいません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 人気の称号TOP5 */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="flex items-center gap-2 font-bold text-black text-sm">
                    <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
                    人気の称号 TOP5
                  </h3>
                </div>
                <div className="p-4">
                  {popularTitles.length > 0 ? (
                    <div className="space-y-2">
                      {popularTitles.map((t, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50">
                          <span
                            className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full font-black text-[10px]"
                            style={{
                              background: i === 0 ? "#FFFF00" : i === 1 ? "#e5e7eb" : i === 2 ? "#fed7aa" : "#f3f4f6",
                            }}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{t.name}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{t.count}人</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Trophy className="w-8 h-8 text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">データがありません</p>
                    </div>
                  )}
                </div>
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
