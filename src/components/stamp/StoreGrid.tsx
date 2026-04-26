"use client";

import { useState } from "react";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  region: string;
}

interface Props {
  stores: Store[];
  visitedStoreIds: Set<string>;
}

export function StoreGrid({ stores, visitedStoreIds }: Props) {
  const [filter, setFilter] = useState<"all" | "visited" | "unvisited">("all");

  const regions = Array.from(new Set(stores.map((s) => s.region))).sort();

  const filtered = stores.filter((s) => {
    if (filter === "visited") return visitedStoreIds.has(s.id);
    if (filter === "unvisited") return !visitedStoreIds.has(s.id);
    return true;
  });

  const filteredByRegion = regions
    .map((r) => ({ region: r, stores: filtered.filter((s) => s.region === r) }))
    .filter((g) => g.stores.length > 0);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "visited", "unvisited"] as const).map((f) => {
          const labels = { all: "すべて", visited: "訪問済み", unvisited: "未訪問" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                filter === f
                  ? "bg-[#FFFF00] text-black border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Grid by region */}
      <div className="space-y-6">
        {filteredByRegion.map(({ region, stores: regionStores }) => (
          <div key={region}>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-100" />
              {region}（{regionStores.filter((s) => visitedStoreIds.has(s.id)).length}/{regionStores.length}）
              <span className="h-px flex-1 bg-gray-100" />
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {regionStores.map((store) => {
                const visited = visitedStoreIds.has(store.id);
                return (
                  <Link
                    key={store.id}
                    href={`/stores/${store.id}`}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:opacity-80 ${
                      visited
                        ? "bg-[#FFFF00] border-black shadow-md"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {/* Stamp icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 ${
                        visited
                          ? "bg-black border-black text-[#FFFF00]"
                          : "bg-white border-gray-300 text-gray-300"
                      }`}
                    >
                      {visited ? "🍜" : "○"}
                    </div>
                    <p
                      className={`text-xs font-bold leading-tight text-center line-clamp-2 ${
                        visited ? "text-black" : "text-gray-400"
                      }`}
                    >
                      {store.name.replace("ラーメン二郎 ", "")}
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
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-sm">
          該当する店舗がありません
        </div>
      )}
    </div>
  );
}
