"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { StorePanel } from "./StorePanel";
import type { Store } from "./StorePanel";
import { ChevronDown, ChevronUp } from "lucide-react";

const MapDisplay = dynamic(() => import("./MapDisplay").then((m) => m.MapDisplay), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-10 h-10 border-4 border-[#FFFF00] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">地図を読み込み中...</span>
      </div>
    </div>
  ),
});

interface Props {
  stores: Store[];
  visitedStoreIds: string[];
}

export function MapView({ stores, visitedStoreIds }: Props) {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Mobile: map toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMapExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-black text-white text-sm font-bold"
        >
          <span>地図を{mapExpanded ? "閉じる" : "開く"}</span>
          {mapExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {mapExpanded && (
          <div className="h-64 relative">
            <MapDisplay
              stores={stores}
              selectedStoreId={selectedStoreId}
              onStoreSelect={setSelectedStoreId}
              visitedStoreIds={visitedStoreIds}
            />
          </div>
        )}
      </div>

      {/* Left panel */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 h-[500px] md:h-full border-r border-gray-100 overflow-hidden">
        <StorePanel
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelect={setSelectedStoreId}
        />
      </div>

      {/* Right: map (desktop) */}
      <div className="hidden md:block flex-1 relative">
        <MapDisplay
          stores={stores}
          selectedStoreId={selectedStoreId}
          onStoreSelect={setSelectedStoreId}
          visitedStoreIds={visitedStoreIds}
        />
      </div>
    </div>
  );
}
