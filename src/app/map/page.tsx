import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map/MapView";
import type { Store } from "@/components/map/StorePanel";

export const metadata = {
  title: "店舗マップ | Jiro Log",
  description: "ラーメン二郎直系全45店舗の地図と営業情報",
};

export default async function MapPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, address, lat, lng, region, business_hours, closed_days, tags, sns_url")
    .order("region")
    .order("name");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let visitedStoreIds: string[] = [];
  if (user) {
    const { data: visited } = await supabase
      .from("reviews")
      .select("store_id")
      .eq("user_id", user.id);
    visitedStoreIds = [...new Set((visited ?? []).map((r) => r.store_id))];
  }

  return (
    <>
    <Header />
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Page header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
        <div className="w-1 h-6 bg-[#FFFF00]" />
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-none">店舗マップ</h1>
          <p className="text-xs text-gray-500 mt-0.5">直系{stores?.length ?? 0}店舗</p>
        </div>
        {user && visitedStoreIds.length > 0 && (
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full bg-[#FFFF00] border border-black" />
            <span>訪問済み ({visitedStoreIds.length}店)</span>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
            <span>未訪問</span>
          </div>
        )}
      </div>

      {/* Map + panel */}
      <div className="flex-1 overflow-hidden">
        <MapView stores={(stores as Store[]) ?? []} visitedStoreIds={visitedStoreIds} />
      </div>
    </div>
    </>
  );
}
