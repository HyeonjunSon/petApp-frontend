"use client";

/** WalkMap — Leaflet + OpenStreetMap (토큰 불필요).
    pins 모드: 약속 핀 표시(클릭 → onPinClick). picker 모드: 지도를 클릭해 만날 장소 선택.
    마커는 브랜드 테니스볼 divIcon (Leaflet 기본 아이콘의 번들 경로 문제도 회피). */

import { useEffect, useRef } from "react";
import L from "leaflet";

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
};

const TORONTO: [number, number] = [43.6595, -79.34]; // fallback center (east end)

const ballIcon = () =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:#d8e23f;border:3px solid #1e2a23;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

export default function WalkMap({
  pins = [],
  center,
  height = 260,
  picked,
  onPick,
  onPinClick,
}: {
  pins?: MapPin[];
  center?: [number, number]; // [lat, lng]
  height?: number;
  /** picker 모드: 현재 선택된 지점 */
  picked?: { lat: number; lng: number } | null;
  onPick?: (p: { lat: number; lng: number }) => void;
  onPinClick?: (id: string) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onPickRef = useRef(onPick);
  const onPinClickRef = useRef(onPinClick);
  onPickRef.current = onPick;
  onPinClickRef.current = onPinClick;

  // init once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const first = pins[0];
    const c: [number, number] =
      center || (first ? [first.lat, first.lng] : TORONTO);
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView(c, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      onPickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw markers (pins + picked)
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    pins.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: ballIcon() }).addTo(layer);
      if (p.label) m.bindTooltip(p.label, { direction: "top", offset: [0, -10] });
      if (onPinClickRef.current) m.on("click", () => onPinClickRef.current?.(p.id));
    });
    if (picked) {
      L.marker([picked.lat, picked.lng], { icon: ballIcon() })
        .addTo(layer)
        .bindTooltip("Meeting point", { direction: "top", offset: [0, -10] });
    }

    const all: [number, number][] = [
      ...pins.map((p) => [p.lat, p.lng] as [number, number]),
      ...(picked ? [[picked.lat, picked.lng] as [number, number]] : []),
    ];
    if (all.length > 1) map.fitBounds(L.latLngBounds(all).pad(0.25));
    else if (all.length === 1) map.setView(all[0], 14);
  }, [pins, picked]);

  return (
    <div
      ref={elRef}
      style={{
        height,
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        border: "1px solid var(--line)",
        zIndex: 0,
      }}
      aria-label="Map"
    />
  );
}
