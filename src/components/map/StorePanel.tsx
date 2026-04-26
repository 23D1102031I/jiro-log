"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, ExternalLink } from "lucide-react";
import { BusinessStatusBadge } from "./BusinessStatusBadge";
import type { BusinessHours } from "./BusinessStatusBadge";

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  region: string;
  business_hours: BusinessHours | null;
  closed_days: string | null;
  tags: string[] | null;
  sns_url: string | null;
}

interface Props {
  stores: Store[];
  selectedStoreId: string | null;
  onSelect: (id: string) => void;
}

export function StorePanel({ stores, selectedStoreId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const regions = useMemo(
    () => ["all", ...Array.from(new Set(stores.map((s) => s.region))).sort()],
    [stores]
  );

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const matchQuery =
        query === "" ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.address.toLowerCase().includes(query.toLowerCase());
      const matchRegion = regionFilter === "all" || s.region === regionFilter;
      return matchQuery && matchRegion;
    });
  }, [stores, query, regionFilter]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="店舗名・住所で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent"
          />
        </div>
        {/* Region filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                regionFilter === r
                  ? "bg-[#FFFF00] text-black border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {r === "all" ? "すべて" : r}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{filtered.length}店舗</p>
      </div>

      {/* Store list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-sm">該当する店舗が見つかりません</p>
          </div>
        ) : (
          filtered.map((store) => (
            <button
              key={store.id}
              onClick={() => onSelect(store.id)}
              className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-yellow-50 ${
                selectedStoreId === store.id ? "bg-[#FFFF00]/20 border-l-4 border-[#FFFF00]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight truncate">{store.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{store.address}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <BusinessStatusBadge businessHours={store.business_hours} />
                    <span className="text-xs text-gray-400">{store.region}</span>
                  </div>
                </div>
                {store.sns_url && (
                  <a
                    href={store.sns_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-gray-300 hover:text-blue-400 transition-colors mt-0.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
