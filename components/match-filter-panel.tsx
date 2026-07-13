'use client';

import React, { useState, useRef, useEffect } from 'react';
import { hostCities, type HostCity } from './host-city-data';

export type MatchFilters = {
  date: string;
  team: string;
  stage: string;
  city: string;
};

type MatchFilterPanelProps = {
  filters: MatchFilters;
  onChange: (filters: MatchFilters) => void;
};

// Searchable Dropdown Sub-component
type SearchableDropdownProps = {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
  accentColor: string;
};

function SearchableDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
  accentColor,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search input
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 w-full text-slate-300">
      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">
        {label}
      </span>
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="w-full text-left bg-slate-950/80 border border-white/10 hover:border-cyan-400/40 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-inner"
        style={{
          borderColor: value ? `${accentColor}33` : undefined,
          boxShadow: value ? `inset 0 0 10px ${accentColor}10` : undefined,
        }}
      >
        <span className={value ? "text-white font-medium" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <span className="text-[10px] text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[105%] left-0 w-full z-50 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-md animate-slide-in-top">
          {options.length > 5 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400/40 mb-1.5"
            />
          )}
          <div className="max-h-36 overflow-y-auto scrollbar-thin flex flex-col gap-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt === value ? '' : opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    opt === value
                      ? 'bg-cyan-500/20 text-white font-semibold'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: opt === value ? `${accentColor}25` : undefined,
                  }}
                >
                  {opt}
                </button>
              ))
            ) : (
              <span className="text-[10px] text-slate-500 text-center py-2">No results</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchFilterPanel({ filters, onChange }: MatchFilterPanelProps) {
  // Extract unique filter options dynamically from hostCities dataset
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [uniqueTeams, setUniqueTeams] = useState<string[]>([]);
  const [uniqueStages, setUniqueStages] = useState<string[]>([]);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);

  useEffect(() => {
    const dates = new Set<string>();
    const teams = new Set<string>();
    const stages = new Set<string>();
    const cities = new Set<string>();

    hostCities.forEach((city) => {
      cities.add(city.name);
      
      if (city.teamInfo) {
        if (city.teamInfo.homeTeam) teams.add(city.teamInfo.homeTeam);
        if (city.teamInfo.awayTeam) teams.add(city.teamInfo.awayTeam);
      }

      if (city.fixtures) {
        city.fixtures.forEach((fix) => {
          if (fix.time) {
            // Get date prefix, e.g. "Aug 17" from "Aug 17 • 19:00 UTC"
            const datePart = fix.time.split(' • ')[0];
            dates.add(datePart);
          }
          if (fix.stage) {
            stages.add(fix.stage);
          }
        });
      }
    });

    setUniqueDates(Array.from(dates).sort());
    setUniqueTeams(Array.from(teams).sort());
    setUniqueStages(Array.from(stages).sort());
    setUniqueCities(Array.from(cities).sort());
  }, []);

  const handleFilterChange = (key: keyof MatchFilters, val: string) => {
    onChange({
      ...filters,
      [key]: val,
    });
  };

  const clearFilters = () => {
    onChange({
      date: '',
      team: '',
      stage: '',
      city: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((f) => f !== '');

  return (
    <div className="rounded-[20px] border border-cyan-400/25 bg-slate-950/70 p-3.5 backdrop-blur-lg shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🏟️</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Match Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[9px] uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SearchableDropdown
          label="Stage"
          placeholder="All Stages"
          value={filters.stage}
          options={uniqueStages}
          onChange={(val) => handleFilterChange('stage', val)}
          accentColor="#22d3ee"
        />

        <SearchableDropdown
          label="Date"
          placeholder="All Dates"
          value={filters.date}
          options={uniqueDates}
          onChange={(val) => handleFilterChange('date', val)}
          accentColor="#7c3aed"
        />

        <SearchableDropdown
          label="Team"
          placeholder="All Teams"
          value={filters.team}
          options={uniqueTeams}
          onChange={(val) => handleFilterChange('team', val)}
          accentColor="#f97316"
        />

        <SearchableDropdown
          label="Host City"
          placeholder="All Cities"
          value={filters.city}
          options={uniqueCities}
          onChange={(val) => handleFilterChange('city', val)}
          accentColor="#14b8a6"
        />
      </div>
    </div>
  );
}
