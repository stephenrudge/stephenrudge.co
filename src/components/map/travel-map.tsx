"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { MapPin } from "@/types";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#C85A32;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface TravelMapProps {
  pins: MapPin[];
  className?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
}

export function TravelMap({
  pins,
  className = "h-[420px] w-full",
  zoom = 2,
  center = [20, 0],
  interactive = true,
}: TravelMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      className={className}
      style={{ background: "#e7e5e4" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.slug} position={[pin.lat, pin.lng]} icon={pinIcon}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{pin.location}</p>
              <Link href={`/blog/${pin.slug}`} className="text-[#C85A32] underline">
                {pin.title}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
