"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Store } from "./StorePanel";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface Props {
  stores: Store[];
  selectedStoreId: string | null;
  onStoreSelect: (id: string) => void;
  visitedStoreIds: string[];
}

function createPinHtml(visited: boolean, selected: boolean) {
  const bg = visited ? "#FFFF00" : selected ? "#111" : "#2563EB";
  const border = visited ? "#000" : selected ? "#FFFF00" : "#1d4ed8";
  const size = selected ? 34 : 28;
  return `<div style="width:${size}px;height:${size}px;background:${bg};border:2.5px solid ${border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35);transition:all 0.15s"></div>`;
}

export function MapDisplay({ stores, selectedStoreId, onStoreSelect, visitedStoreIds }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: typeof import("leaflet");

    import("leaflet").then((mod) => {
      L = mod.default ?? mod;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [35.6452, 139.741],
        zoom: 11,
        minZoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        minZoom: 5,
      }).addTo(map);

      mapRef.current = map;

      stores.forEach((store) => {
        const visited = visitedStoreIds.includes(store.id);
        const icon = L.divIcon({
          html: createPinHtml(visited, false),
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
        });

        const marker = L.marker([store.lat, store.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:200px;font-family:'Noto Sans JP',sans-serif">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;line-height:1.4">${store.name}</div>
              <div style="font-size:11px;color:#666;margin-bottom:6px">${store.address}</div>
              ${store.closed_days ? `<div style="font-size:11px;color:#888">定休日: ${store.closed_days}</div>` : ""}
            </div>`,
            { maxWidth: 260 }
          );

        marker.on("click", () => onStoreSelect(store.id));
        markersRef.current.set(store.id, marker);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to selected store
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStoreId) return;

    const store = stores.find((s) => s.id === selectedStoreId);
    if (!store) return;

    map.setView([store.lat, store.lng], 15, { animate: true });
    markersRef.current.get(selectedStoreId)?.openPopup();
  }, [selectedStoreId, stores]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
