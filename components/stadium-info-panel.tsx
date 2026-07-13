"use client";

import { useState } from "react";
import { hostCities, type HostCity } from "@/components/host-city-data";
import { type MatchFilters } from "@/components/match-filter-panel";

type StadiumInfoPanelProps = {
  city: HostCity | null;
  onSelectCity: (city: HostCity) => void;
  onReset: () => void;
  onToggleAI?: () => void;
  aiOpen?: boolean;
  filteredCities: HostCity[];
  filters: MatchFilters;
};

export function StadiumInfoPanel({ 
  city, 
  onSelectCity, 
  onReset, 
  onToggleAI, 
  aiOpen,
  filteredCities,
  filters
}: StadiumInfoPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!city) {
    return (
      <aside key="empty" className="animate-slide-in absolute right-4 top-4 z-20 w-[min(20rem,calc(100%-2rem))] rounded-[22px] border border-cyan-400/25 bg-slate-950/80 p-4 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl md:w-[22rem]">
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
              {filteredCities.map((c) => (
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
    <aside key={city.id} className="animate-slide-in absolute right-4 top-4 z-20 w-[min(20rem,calc(100%-2rem))] rounded-[22px] border border-cyan-400/25 bg-slate-950/80 p-3 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl md:w-[22rem]">
      {/* Mini Header */}
      <div className="flex w-full items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-cyan-300/75">
            Venue Analysis Mode
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-white tracking-wide">{city.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="mt-3 space-y-3.5 text-xs">
          {/* Stadium Image Card */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-md group">
            <img 
              src={city.image} 
              alt={city.stadium} 
              className="h-32 w-full object-cover brightness-[0.8] group-hover:scale-105 transition-transform duration-500" 
            />
            {/* Soft gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute bottom-2 left-2 right-2">
              <span className="rounded-full bg-cyan-500/25 border border-cyan-400/30 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                {city.stadium}
              </span>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-[10px] text-slate-300">Capacity</span>
                <span className="text-sm font-bold text-white tracking-wider">{city.capacity}</span>
              </div>
            </div>
          </div>

          {/* Stadium Logistics */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.28em] text-slate-400">
              Stadium Logistics
            </p>
            <p className="mt-1 text-[11px] text-slate-200 leading-relaxed font-light">{city.stadiumNote}</p>
          </div>

          {/* Team Info / Matchup Card */}
          <div className="rounded-xl border border-cyan-500/15 bg-cyan-950/20 p-2.5">
            <div className="flex items-center justify-between border-b border-cyan-500/10 pb-1.5">
              <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                {city.teamInfo.group}
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400">
                Match Intelligence
              </span>
            </div>
            
            <div className="mt-2.5 flex items-center justify-between gap-1.5">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <p className="text-[11px] font-semibold text-white truncate">{city.teamInfo.homeTeam}</p>
                <p className="text-[9px] text-cyan-300/80 font-bold uppercase mt-0.5">Rank {city.teamInfo.ranking.home}</p>
              </div>

              {/* VS Divider */}
              <div className="rounded-full border border-cyan-500/30 bg-cyan-950/80 px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)] shrink-0">
                VS
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <p className="text-[11px] font-semibold text-white truncate">{city.teamInfo.awayTeam}</p>
                <p className="text-[9px] text-cyan-300/80 font-bold uppercase mt-0.5">Rank {city.teamInfo.ranking.away}</p>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] text-slate-300/80 italic font-light truncate">
              {city.match}
            </p>

            <button
              onClick={onToggleAI}
              className={`w-full mt-2.5 rounded-lg border py-2 text-center text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                aiOpen 
                  ? "bg-violet-600/30 border-violet-500 text-violet-200" 
                  : "bg-violet-600/10 border-violet-500/30 text-violet-300 hover:bg-violet-600/20"
              }`}
            >
              ✦ AI Match Intelligence
            </button>
          </div>

          {/* Fixtures List */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.28em] text-slate-400">
                Live Fixtures
              </p>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-slate-300 uppercase tracking-widest">
                {city.status}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {city.fixtures.filter(fixture => {
                if (filters.stage && fixture.stage !== filters.stage) return false;
                if (filters.date && !fixture.time.startsWith(filters.date)) return false;
                return true;
              }).map((fixture) => (
                <div
                  key={`${city.id}-${fixture.label}`}
                  className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-white">{fixture.label}</p>
                    <span className="text-[9px] text-cyan-300 tracking-wider shrink-0">{fixture.time}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-300 font-light">{fixture.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={onReset}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-[11px] font-semibold text-slate-200 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
          >
            ← Reset Camera & Return to Map
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full mt-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 py-2 text-center text-[11px] font-semibold text-cyan-200 hover:bg-cyan-400/10 transition-all cursor-pointer"
        >
          Expand Details Panel
        </button>
      )}
    </aside>
  );
}
