"use client";
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ShieldAlert, Activity, Crosshair } from "lucide-react";

// 🔗 BACKEND_READY: This state will be updated via your Node.js API later
const initialFakes = [
  {
    id: 1,
    lat: 6.4549,
    lng: 3.4246,
    city: "Lagos Island",
    intensity: 1.0,
    count: 142,
  },
  { id: 2, lat: 9.0765, lng: 7.3985, city: "Abuja", intensity: 0.7, count: 54 },
  {
    id: 3,
    lat: 12.0022,
    lng: 8.592,
    city: "Kano Central",
    intensity: 0.9,
    count: 89,
  },
];

export default function RealTimeFraudMap() {
  const [data, setData] = useState(initialFakes);

  // This simulates "Live Updates" coming from your backend
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((item) => ({
          ...item,
          intensity: Math.random() * (1.2 - 0.5) + 0.5, // Pulsing intensity logic
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-100px)] p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
            <Activity className="text-red-500" /> Live Threat Intelligence
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
            Active Counterfeit Clusters • Nigeria
          </p>
        </div>
        <div className="bg-red-600/10 border border-red-500/20 px-6 py-2 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-black text-red-500 uppercase">
            System Listening...
          </span>
        </div>
      </div>

      <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/10 relative shadow-2xl">
        <MapContainer
          center={[9.082, 8.6753]} // Center of Nigeria
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", background: "#050505" }}
        >
          {/* Using a Dark-Mode Tile Provider */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {data.map((point) => (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={15 * point.intensity} // This makes the circle "pulse"
              pathOptions={{
                fillColor: "#ef4444",
                color: "#7f1d1d",
                weight: 1,
                fillOpacity: 0.6,
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={1}
                permanent={false}
              >
                <div className="bg-black text-white p-2 rounded-lg border border-red-500/50">
                  <p className="text-[10px] font-black uppercase">
                    {point.city}
                  </p>
                  <p className="text-xs font-bold text-red-500">
                    {point.count} Suspicious Scans
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Tactical UI Overlay */}
        <div className="absolute top-8 right-8 z-[1000] w-64 space-y-4 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <p className="text-[9px] font-black text-gray-500 uppercase mb-2">
              Target Lock
            </p>
            <div className="flex items-center gap-3">
              <Crosshair className="text-green-500" size={16} />
              <span className="text-xs font-bold text-white">
                Lagos Cluster Alpha
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
