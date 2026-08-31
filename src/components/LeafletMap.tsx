import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string;
  lat: number;
  lon: number;
  title: string;
  subtitle?: string;
};

export type LeafletMapProps = {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onPick?: (lat: number, lon: number) => void;
  onMarkerClick?: (id: string) => void;
};

const pinIcon = () =>
  L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:#A8C928;border:2px solid #3E571C;box-shadow:0 4px 10px rgba(38,50,27,.35)"><span style="width:9px;height:9px;border-radius:50%;background:#26321B"></span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

export default function LeafletMap({
  center,
  zoom = 13,
  markers = [],
  onPick,
  onMarkerClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
      center,
      zoom,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      detectRetina: true,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onPick) return;
    const handler = (event: L.LeafletMouseEvent) => onPick(event.latlng.lat, event.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onPick]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markers.forEach((marker) => {
      const pin = L.marker([marker.lat, marker.lon], { icon: pinIcon(), title: marker.title });
      pin.bindPopup(
        `<strong>${marker.title}</strong>${marker.subtitle ? `<br/>${marker.subtitle}` : ""}`,
      );
      if (onMarkerClick) pin.on("click", () => onMarkerClick(marker.id));
      pin.addTo(layer);
    });
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Mapa interativo" />;
}
