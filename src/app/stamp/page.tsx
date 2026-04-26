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

  if (user) {
    const { data: visited } = await supabase
      .from("reviews")
      .select("store_id")
      .eq("user_id", user.id);
    visitedIds = [...new Set((visited ?? []).map((r) => r.store_id))];

    const { data: userTitles } = await supabase
      .from("user_titles")
      .select("titles(name)")
      .eq("user_id", user.id)
      .order("achieved_at", { ascending: false })
      .limit(1);

    if (userTitles && userTitles[0]) {
      const t = userTitles[0].titles;
      if (Array.isArray(t) && t[0]) {
        topTitleName = (t[0] as { name: string }).name;
      } else if (t && !Array.isArray(t)) {
        topTitleName = (t as { name: string }).name;
      }
    }
  }

  const allStores = stores ?? [];
  const total = allStores.length;
  const visitedCount = visitedIds.length;
  const visitedSet = new Set(visitedIds);
  const pct = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👑</span>
            <h1
              className="text-3xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
            >
              直系全店制覇コンプリート
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-7">
            ラーメン二郎全{total}店舗を制覇目指そう！ / Complete the Str8ight Line
          </p>
        </div>

        {/* 進捗 + 称号 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* 進捗カード */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
            <CircleProgress visited={visitedCount} total={total} size={120} />
            <div>
              <p className="text-xs text-gray-400 mb-1">現在の制覇状況</p>
              <div
                className="text-4xl font-black text-black leading-none"
                style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
              >
                {visitedCount}
                <span className="text-xl text-gray-400">/{total}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{pct}% 達成</p>
              {!user && (
                <p className="text-xs text-gray-400 mt-2">ログインで記録されます</p>
              )}
            </div>
          </div>

          {/* 称号カード */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            {topTitleName ? (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">獲得した最高の称号</p>
                <div className="w-20 h-20 rounded-full bg-[#FFFF00] border-4 border-black flex items-center justify-center mb-3 shadow-md">
                  <span className="text-3xl">👑</span>
                </div>
                <p
                  className="text-lg font-black text-gray-900"
                  style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
                >
                  {topTitleName}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">獲得した最高の称号</p>
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                  <span className="text-3xl text-gray-300">?</span>
                </div>
                <p className="text-sm text-gray-500">
                  {visitedCount === 0
                    ? "最初の一杯を記録して\n称号を獲得しよう"
                    : `残り${total - visitedCount}店で全制覇！`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* 店舗グリッド */}
        <StoreGrid stores={allStores} visitedStoreIds={visitedSet} />
      </main>
      <Footer />
    </>
  );
}
