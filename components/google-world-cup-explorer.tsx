"use client";

import { useEffect, useMemo, useState } from "react";
import { StadiumInfoPanel } from "@/components/stadium-info-panel";
import { hostCities, type HostCity } from "@/components/host-city-data";
import Map3D from "@/components/map-3d";

function isWebGL2Available() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

export function GoogleWorldCupExplorer() {
  const [selectedCity, setSelectedCity] = useState<HostCity | null>(null);
  const [webGL2Supported, setWebGL2Supported] = useState(true);
  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setWebGL2Supported(isWebGL2Available());
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040814] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),transparent_20%),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.18),transparent_25%),linear-gradient(135deg,_#020617,_#05111f_50%,_#020617)]" />

      <div className="absolute left-4 top-4 z-20 w-[min(20rem,calc(100%-2rem))] rounded-[20px] border border-cyan-400/25 bg-slate-950/70 p-3 backdrop-blur-lg">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
              SportSphere AI
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white md:text-2xl">
              World Cup Host City Explorer
            </h1>
          </div>
          <div className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.28em] ${
            webGL2Supported 
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" 
              : "border-amber-400/40 bg-amber-400/10 text-amber-100"
          }`}>
            {webGL2Supported ? "3D map mode" : "2D fallback"}
          </div>
        </div>

        <p className="mt-2 max-w-xl text-[12px] text-slate-300">
          Futuristic host city network across North America with glowing markers,
          match intelligence, and venue detail.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hostCities.map((city) => {
            const isSelected = selectedCity?.id === city.id;
            return (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={`rounded-full border px-2 py-0.5 text-[10px] transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/20 text-white font-medium shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full border border-cyan-300/60 bg-cyan-400/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
            3D View
          </span>
          {selectedCity && (
            <button
              onClick={() => setSelectedCity(null)}
              className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-medium text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              Reset Camera
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 min-h-screen w-full">
        {hasApiKey ? (
          <Map3D selectedCity={selectedCity} onSelectCity={setSelectedCity} />
        ) : (
          <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Please add a valid Google Maps API key.</p>
          </div>
        )}
      </div>

      <StadiumInfoPanel 
        city={selectedCity} 
        onSelectCity={setSelectedCity} 
        onReset={() => setSelectedCity(null)} 
      />

      {!hasApiKey ? (
        <div className="absolute bottom-4 left-4 z-20 max-w-md rounded-2xl border border-amber-400/35 bg-slate-950/80 p-4 text-sm text-amber-100 backdrop-blur-lg">
          Add <span className="font-semibold text-white">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> to enable the live Google Maps layer.
        </div>
      ) : !webGL2Supported ? (
        <div className="absolute bottom-4 left-4 z-20 max-w-md rounded-2xl border border-amber-400/35 bg-slate-950/80 p-3 text-xs text-amber-200/90 backdrop-blur-lg">
          ⚠️ <strong>WebGL2 is unsupported in this browser.</strong> Running in interactive 2D Map fallback mode. Try enabling hardware acceleration in browser settings.
        </div>
      ) : null}
    </div>
  );
}
