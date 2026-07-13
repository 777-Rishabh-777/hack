"use client";

import { useState } from "react";
import { hostCities, type HostCity } from "@/components/host-city-data";

type StadiumInfoPanelProps = {
  city: HostCity | null;
  onSelectCity: (city: HostCity) => void;
  onReset: () => void;
};

export function StadiumInfoPanel({ city, onSelectCity, onReset }: StadiumInfoPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!city) {
    return (
      <aside className="absolute right-4 top-4 z-20 w-[min(20rem,calc(100%-2rem))] rounded-[22px] border border-cyan-400/25 bg-slate-950/80 p-4 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl md:w-[22rem]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75 animate-pulse">
            ✦ SportSphere AI
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">World Cup 2026</h2>
        </div>
        
        <div className="mt-4 space-y-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-semibold text-cyan-100">Select a Host City</p>
            <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">
              Click on any floating 3D marker on the map, or choose a host city below to zoom directly to its stadium, matches, and local intelligence.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-2">
              Host Cities & Stadiums
            </p>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              {hostCities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCity(c)}
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all cursor-pointer group"
                >
                  <div className="truncate">
                    <p className="text-[12px] font-medium text-white group-hover:text-cyan-200 transition-colors">{c.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.stadium}</p>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="absolute right-4 top-4 z-20 w-[min(20rem,calc(100%-2rem))] rounded-[22px] border border-cyan-400/25 bg-slate-950/80 p-3 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl md:w-[22rem]">
      <button
        type="button"
        onClick={() => setIsCollapsed((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/75">
            SportSphere AI
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">{city.name}</h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-300">
          {isCollapsed ? "Expand" : "Collapse"}
        </span>
      </button>

      {!isCollapsed ? (
        <div className="mt-3 space-y-2 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
              Stadium
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-50">{city.stadium}</p>
            <p className="mt-1 text-[12px] text-slate-300">{city.stadiumNote}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2.5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200">
                Match info
              </p>
              <p className="mt-1 text-[12px] font-semibold text-white">{city.match}</p>
            </div>
            <div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-2.5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-fuchsia-200">
                Live signal
              </p>
              <p className="mt-1 text-[12px] font-semibold text-white">
                AI route sync: 94%
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                Fixtures
              </p>
              <span className="rounded-full border px-2 py-0.5 text-[10px] text-slate-300">
                {city.status}
              </span>
            </div>

            <div className="space-y-1.5">
              {city.fixtures.map((fixture) => (
                <div
                  key={`${city.id}-${fixture.label}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-white">{fixture.label}</p>
                    <span className="text-[10px] text-cyan-300">{fixture.time}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">{fixture.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full mt-2 rounded-xl border border-white/10 bg-white/5 py-2 text-center text-[11px] font-medium text-slate-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200 transition-all cursor-pointer"
          >
            ← Back to Global View
          </button>
        </div>
      ) : null}
    </aside>
  );
}
