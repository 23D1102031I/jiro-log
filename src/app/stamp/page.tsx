import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { CircleProgress } from "@/components/stamp/CircleProgress";
import { StoreGrid } from "@/components/stamp/StoreGrid";

export const metadata = { title: "スタンプカード | Jiro Log" };

export default async function StampPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, region")
    .order("region")
    .order("name");

  const { data: { user } } = await supabase.auth.getUser();

  let visitedIds: string[] = [];
  let topTitleName: string | null = null;
  let topTitleDescription: string | null = null;

  if (user) {
    const { data: visited } = await supabase
      .from("reviews")
      .select("store_id")
      .eq("user_id", user.id);
    visitedIds = [...new Set((visited ?? []).map((r) => r.store_id))];

    const { data: userTitles } = await supabase
      .from("user_titles")
      .select("titles(name, description)")
      .eq("user_id", user.id)
      .order("achieved_at", { ascending: false })
      .limit(1);

    if (userTitles && userTitles[0]) {
      const t = userTitles[0].titles;
      if (Array.isArray(t) && t[0]) {
        topTitleName = (t[0] as { name: string; description: string }).name;
        topTitleDescription = (t[0] as { name: string; description: string }).description ?? null;
      } else if (t && !Array.isArray(t)) {
        topTitleName = (t as { name: string; description: string }).name;
        topTitleDescription = (t as { name: string; description: string }).description ?? null;
      }
    }
  }

  const allStores = stores ?? [];
  const total = allStores.length;
  const visitedCount = visitedIds.length;
  const visitedSet = new Set(visitedIds);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* 左カラム：タイトル + スタンプグリッド */}
          <div className="order-last lg:order-first">
            {/* タイトルヘッダー */}
            <div className="mb-6">
              <h1
                className="text-3xl font-black"
                style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
              >
                👑 直系全店制覇コンプリート
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ラーメン二郎 直系全{total}店舗を制覇を目指そう！ / Complete the Str8ight Line
              </p>
            </div>

            {/* 店舗グリッド */}
            <StoreGrid stores={allStores} visitedStoreIds={visitedSet} />
          </div>

          {/* 右カラム：sticky サイドバー */}
          <div className="order-first lg:order-last lg:sticky lg:top-20 space-y-4">

            {/* ① 現在の制覇状況カード */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">現在の制覇状況</p>
              <div className="flex justify-center mb-4">
                <CircleProgress visited={visitedCount} total={total} size={160} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFFF00] border border-black inline-block" />
                    訪問済み
                  </span>
                  <span className="font-bold">{visitedCount} 店舗</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />
                    未訪問
                  </span>
                  <span className="font-bold text-gray-500">{total - visitedCount} 店舗</span>
                </div>
              </div>
            </div>

            {/* ② 獲得した最高位の称号カード */}
            <div className="bg-black rounded-2xl p-5 text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">獲得した最高の称号</p>
              {topTitleName ? (
                <>
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 border-4 border-yellow-400 flex items-center justify-center mb-3 shadow-xl">
                    <span className="text-4xl">👑</span>
                  </div>
                  <p
                    className="text-[#FFFF00] font-black text-lg"
                    style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                  >
                    {topTitleName}
                  </p>
                  {topTitleDescription && (
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">{topTitleDescription}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="w-24 h-24 mx-auto rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center mb-3">
                    <span className="text-4xl text-gray-600">?</span>
                  </div>
                  <p className="text-gray-400 text-sm">最初の一杯を記録して<br />称号を獲得しよう</p>
                </>
              )}
            </div>

            {/* ③ モチベーションテキスト */}
            <div className="bg-[#FFFF00] rounded-2xl p-4 text-center">
              {total - visitedCount > 0 ? (
                <>
                  <p className="text-black font-black text-lg">全店制覇まであと</p>
                  <p
                    className="text-black font-black text-4xl"
                    style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                  >
                    {total - visitedCount} 店舗！
                  </p>
                </>
              ) : (
                <p className="text-black font-black text-lg">🎉 全店制覇達成！</p>
              )}
              <p className="text-black/60 text-xs mt-1">次の一杯が、伝説への一歩。</p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
