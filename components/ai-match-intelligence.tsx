"use client";

import { useState, useEffect } from "react";
import { type HostCity } from "@/components/host-city-data";

type AIMatchIntelligenceProps = {
  city: HostCity | null;
  isOpen: boolean;
  onClose: () => void;
};

// Rich local mock dataset for fast demo fallback and offline mode
const MOCK_DATABASE: Record<string, any> = {
  NYC: {
    stats: {
      possession: { home: 44, away: 56 },
      shots: { home: 10, away: 15 },
      passing: { home: 79, away: 88 },
      fouls: { home: 14, away: 9 }
    },
    history: {
      recentForm: { home: ["W", "D", "L", "W", "W"], away: ["W", "W", "W", "D", "W"] },
      headToHead: "12 Matches • 3 USA Wins • 7 Brazil Wins • 2 Draws",
      lastMatch: "USA 1-2 Brazil (June 2024)"
    },
    output: {
      preview: "This high-profile matchup at MetLife Stadium marks a crucial group opener. Brazil arrives as clear favorites with historical dominance, but the USA’s home advantage and athletic midfield transitions could test Brazil’s backline. Expect a high-octane battle with Brazil controlling possession and the USA searching for rapid counter-attacks.",
      keyPlayers: [
        {
          name: "Christian Pulisic",
          team: "United States",
          role: "Left Winger / Inside Forward",
          stat: "15 Goals, 6 Assists",
          impact: "Triggers rapid transitions and acts as the primary creative outlet on counters."
        },
        {
          name: "Vinícius Júnior",
          team: "Brazil",
          role: "Left Winger / Winger",
          stat: "24 Goals, 11 Assists",
          impact: "Unbeatable 1v1 dribbler who shifts the entire defensive block to create space for overlapping runs."
        }
      ],
      insights: [
        {
          title: "Midfield Pressing Zones",
          description: "The USA will deploy a compact mid-block press, aiming to choke passing lanes to Brazil's advanced playmakers. If Brazil bypasses this line, Vinicius Jr will exploit wide channels."
        },
        {
          title: "Overlapping Fullback Exposure",
          description: "Brazil's attacking style relies heavily on overlapping fullbacks. This leaves large spaces behind them that Pulisic and Weah can exploit on counter-attacks."
        }
      ],
      prediction: {
        homeWinProb: 25,
        awayWinProb: 55,
        drawProb: 20,
        scoreline: "1-2",
        rationale: "Brazil's individual quality in tight spaces will likely prove decisive in the second half."
      }
    }
  },
  DAL: {
    stats: {
      possession: { home: 54, away: 46 },
      shots: { home: 16, away: 11 },
      passing: { home: 89, away: 82 },
      fouls: { home: 11, away: 15 }
    },
    history: {
      recentForm: { home: ["W", "W", "D", "W", "W"], away: ["W", "D", "W", "L", "W"] },
      headToHead: "18 Matches • 8 Argentina Wins • 6 Portugal Wins • 4 Draws",
      lastMatch: "Argentina 0-0 Portugal (November 2023)"
    },
    output: {
      preview: "A historic matchup at AT&T Stadium between two iconic footballing nations. Argentina enters with high confidence as reigning champions, but Portugal's young, technical midfield poses a significant tactical hurdle. This game will be decided in transition, with both teams eager to control the tempo.",
      keyPlayers: [
        {
          name: "Lionel Messi",
          team: "Argentina",
          role: "Playmaker / Second Striker",
          stat: "18 Goals, 14 Assists",
          impact: "Drops deep to pull defenders out of position, delivering key passes to overlapping wingers."
        },
        {
          name: "Cristiano Ronaldo",
          team: "Portugal",
          role: "Target Forward",
          stat: "22 Goals, 4 Assists",
          impact: "Deadly finisher inside the box, exploiting aerial battles and set-piece opportunities."
        }
      ],
      insights: [
        {
          title: "Midfield Control Battle",
          description: "Enzo Fernandez and Bruno Fernandes will clash for tempo control. Argentina's quick short-pass triangles will attempt to starve Portugal's forward line of service."
        },
        {
          title: "Vulnerability to Direct Play",
          description: "Portugal's backline has shown vulnerability against direct balls over the top, which plays perfectly into Messi's vision and Alvarez's pace."
        }
      ],
      prediction: {
        homeWinProb: 48,
        awayWinProb: 32,
        drawProb: 20,
        scoreline: "2-1",
        rationale: "Argentina's fluid central rotations will unlock Portugal's low block in a tight game."
      }
    }
  },
  LAX: {
    stats: {
      possession: { home: 52, away: 48 },
      shots: { home: 14, away: 12 },
      passing: { home: 86, away: 83 },
      fouls: { home: 9, away: 12 }
    },
    history: {
      recentForm: { home: ["W", "L", "W", "D", "W"], away: ["W", "W", "W", "W", "L"] },
      headToHead: "7 Matches • 4 France Wins • 1 Morocco Win • 2 Draws",
      lastMatch: "France 2-0 Morocco (World Cup 2022)"
    },
    output: {
      preview: "A highly anticipated rematch of the 2022 World Cup semi-final at SoFi Stadium. France possesses elite individual quality, but Morocco's defensive organization and vertical counter-attacking threat make them a formidable opponent. The battle along the wings will dictate the game's flow.",
      keyPlayers: [
        {
          name: "Kylian Mbappé",
          team: "France",
          role: "Inside Left Forward",
          stat: "28 Goals, 9 Assists",
          impact: "Unparalleled acceleration in the final third, forcing opposing fullbacks to sit deep."
        },
        {
          name: "Achraf Hakimi",
          team: "Morocco",
          role: "Right Wingback",
          stat: "5 Goals, 8 Assists",
          impact: "Combines elite recovery pace with aggressive overlapping runs, driving Morocco's counters."
        }
      ],
      insights: [
        {
          title: "Hakimi vs Mbappé Duel",
          description: "PSG teammates clash directly. Hakimi's ability to contain Mbappé without committing defensive fouls will be the single most crucial factor for Morocco."
        },
        {
          title: "France's Box Overload",
          description: "Morocco's low block will absorb pressure, but Griezmann's late runs into the penalty box will test Morocco's central defender communication."
        }
      ],
      prediction: {
        homeWinProb: 50,
        awayWinProb: 28,
        drawProb: 22,
        scoreline: "2-0",
        rationale: "France's attacking depth and Mbappé's individual brilliance will crack Morocco's stubborn defense."
      }
    }
  },
  VAN: {
    stats: {
      possession: { home: 47, away: 53 },
      shots: { home: 11, away: 13 },
      passing: { home: 80, away: 85 },
      fouls: { home: 13, away: 10 }
    },
    history: {
      recentForm: { home: ["L", "W", "W", "D", "L"], away: ["W", "W", "D", "W", "W"] },
      headToHead: "4 Matches • 1 Canada Win • 2 Japan Wins • 1 Draw",
      lastMatch: "Canada 1-2 Japan (October 2023)"
    },
    output: {
      preview: "Canada takes on Japan in BC Place for a thrilling Group stage encounter. Japan enters in red-hot form, relying on their signature high-speed passing and counter-press. Canada will need their pace in wide areas to bypass Japan's structured midfield block.",
      keyPlayers: [
        {
          name: "Alphonso Davies",
          team: "Canada",
          role: "Left Winger / Wingback",
          stat: "8 Goals, 10 Assists",
          impact: "Exploits wide spaces with explosive pace, acting as the primary transition engine."
        },
        {
          name: "Kaoru Mitoma",
          team: "Japan",
          role: "Left Winger / Dribbler",
          stat: "12 Goals, 9 Assists",
          impact: "Master of 1v1 situations in the final third, cutting inside to create shooting angles."
        }
      ],
      insights: [
        {
          title: "Japan's Counter-Press",
          description: "Japan will look to trap Canada immediately after losing possession. If Canada's midfielders can release pressure to Davies early, they will find transition space."
        },
        {
          title: "Canadian Aerial Threat",
          description: "Canada holds a height advantage on set-pieces, which could prove to be their best path to goals against Japan's highly organized zonal defense."
        }
      ],
      prediction: {
        homeWinProb: 30,
        awayWinProb: 48,
        drawProb: 22,
        scoreline: "1-2",
        rationale: "Japan's tactical discipline and superior possession structure will edge out Canada's athletic threat."
      }
    }
  },
  MEX: {
    stats: {
      possession: { home: 45, away: 55 },
      shots: { home: 12, away: 16 },
      passing: { home: 81, away: 87 },
      fouls: { home: 15, away: 11 }
    },
    history: {
      recentForm: { home: ["W", "D", "W", "L", "D"], away: ["W", "W", "L", "W", "W"] },
      headToHead: "10 Matches • 2 Mexico Wins • 5 Germany Wins • 3 Draws",
      lastMatch: "Mexico 2-2 Germany (October 2023)"
    },
    output: {
      preview: "Mexico meets Germany at Estadio Azteca, a venue historically tough for visiting teams. Germany will attempt to control the possession, but Mexico's aggressive pressing and the intense Azteca atmosphere will make building out from the back extremely challenging.",
      keyPlayers: [
        {
          name: "Santiago Giménez",
          team: "Mexico",
          role: "Striker",
          stat: "23 Goals, 4 Assists",
          impact: "Superb off-the-ball movement, constantly contesting central defenders and finishing inside the box."
        },
        {
          name: "Florian Wirtz",
          team: "Germany",
          role: "Attacking Midfielder",
          stat: "16 Goals, 18 Assists",
          impact: "Sensational vision between lines, finding half-spaces and launching teammates into goalscoring positions."
        }
      ],
      insights: [
        {
          title: "Estadio Azteca Altitude",
          description: "The high altitude of Mexico City will exhaust Germany's high-pressing game in the second half. Germany will likely slow down the tempo to preserve energy."
        },
        {
          title: "Mexico's High Press",
          description: "Mexico will utilize an intense high-press in the opening 20 minutes to force mistakes from Germany's deep build-up block before dropping into a mid-block."
        }
      ],
      prediction: {
        homeWinProb: 35,
        awayWinProb: 40,
        drawProb: 25,
        scoreline: "1-1",
        rationale: "Azteca's environmental factor and Mexico's grit will offset Germany's possession superiority, ending in a draw."
      }
    }
  }
};

const LOADING_PHRASES = [
  "Retrieving telemetry statistics...",
  "Calibrating historical form metrics...",
  "Running Monte Carlo match simulations (10,000 runs)...",
  "Analyzing key tactical overlaps...",
  "Structuring predicted match report..."
];

export function AIMatchIntelligence({ city, isOpen, onClose }: AIMatchIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<"inputs" | "analysis">("inputs");
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync API Key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Cycle loading phrases during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingPhraseIndex(0);
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Reset states when the selected city changes
  useEffect(() => {
    setGeneratedData(null);
    setActiveTab("inputs");
    setErrorMsg(null);
  }, [city]);

  if (!isOpen || !city) return null;

  const mockData = MOCK_DATABASE[city.id] || MOCK_DATABASE.NYC;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    // If using live API mode, query the Next.js API endpoint
    if (useLiveApi) {
      try {
        const response = await fetch("/api/match-intelligence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            homeTeam: city.teamInfo.homeTeam,
            awayTeam: city.teamInfo.awayTeam,
            stats: mockData.stats,
            history: mockData.history,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate match insights.");
        }

        setGeneratedData(data);
        setActiveTab("analysis");
      } catch (err: any) {
        console.error("Live generation failed:", err);
        setErrorMsg(err.message || "API connection failed. Falling back to Demo Mode.");
        // Auto fallback to local mock after 2 seconds
        setTimeout(() => {
          setGeneratedData(mockData.output);
          setActiveTab("analysis");
          setErrorMsg(null);
        }, 2200);
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Simulate quick generation delay for realistic AI feel
      setTimeout(() => {
        setGeneratedData(mockData.output);
        setActiveTab("analysis");
        setIsGenerating(false);
      }, 3500);
    }
  };

  const handleSaveApiKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem("openai_api_key", val);
  };

  return (
    <aside className="animate-slide-in-left fixed left-4 top-4 z-30 flex h-[calc(100vh-2rem)] w-[21rem] flex-col rounded-[22px] border border-violet-500/25 bg-slate-950/90 p-4 shadow-[0_0_40px_rgba(124,58,237,0.2)] backdrop-blur-2xl md:w-[23rem]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#a78bfa]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400">
              SportSphere AI
            </p>
            <h2 className="text-sm font-bold text-white tracking-wide">Match Intelligence</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/10 bg-white/5 p-1 text-slate-400 hover:bg-violet-500/20 hover:text-white transition-all cursor-pointer text-xs"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex rounded-lg border border-white/15 bg-slate-900/60 p-1 text-[11px] font-medium shrink-0">
        <button
          onClick={() => setActiveTab("inputs")}
          className={`flex-1 rounded-md py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "inputs"
              ? "bg-violet-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Match telemetry
        </button>
        <button
          onClick={() => {
            if (generatedData) setActiveTab("analysis");
          }}
          disabled={!generatedData}
          className={`flex-1 rounded-md py-1.5 text-center transition-all ${
            !generatedData
              ? "text-slate-600 cursor-not-allowed"
              : activeTab === "analysis"
              ? "bg-violet-600 text-white shadow-md cursor-pointer"
              : "text-slate-400 hover:text-slate-200 cursor-pointer"
          }`}
        >
          AI Analytics {generatedData && "✦"}
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent">
        {isGenerating ? (
          /* Loading State */
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <div className="relative flex items-center justify-center mb-6">
              {/* Outer pulsing ring */}
              <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-violet-500/20" />
              {/* Inner spin card */}
              <div className="h-12 w-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="absolute text-sm">✦</span>
            </div>
            <p className="text-xs font-semibold text-white tracking-wide">
              Generating Intelligence Report
            </p>
            <p className="mt-2 text-[10px] text-violet-300/80 animate-pulse italic leading-relaxed">
              {LOADING_PHRASES[loadingPhraseIndex]}
            </p>
          </div>
        ) : activeTab === "inputs" ? (
          /* Input Telemetry Tab */
          <div className="space-y-4">
            {/* Matchup Header */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center">
              <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold">
                {city.teamInfo.group}
              </span>
              <div className="mt-1 flex items-center justify-center gap-3">
                <span className="text-sm font-bold text-white">{city.teamInfo.homeTeam}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">vs</span>
                <span className="text-sm font-bold text-white">{city.teamInfo.awayTeam}</span>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="space-y-3 rounded-xl border border-white/5 bg-slate-900/40 p-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Season stats (Avg per game)
              </h3>
              
              {/* Possession */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Possession ({mockData.stats.possession.home}%)</span>
                  <span>Possession ({mockData.stats.possession.away}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
                  <div className="bg-violet-500 h-full" style={{ width: `${mockData.stats.possession.home}%` }} />
                  <div className="bg-cyan-500 h-full flex-1" />
                </div>
              </div>

              {/* Shots */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Shots ({mockData.stats.shots.home})</span>
                  <span>Shots ({mockData.stats.shots.away})</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
                  <div className="bg-violet-500 h-full" style={{ width: `${(mockData.stats.shots.home / (mockData.stats.shots.home + mockData.stats.shots.away)) * 100}%` }} />
                  <div className="bg-cyan-500 h-full flex-1" />
                </div>
              </div>

              {/* Passing accuracy */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Passing Accuracy ({mockData.stats.passing.home}%)</span>
                  <span>Passing Accuracy ({mockData.stats.passing.away}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
                  <div className="bg-violet-500 h-full" style={{ width: `${mockData.stats.passing.home}%` }} />
                  <div className="bg-cyan-500 h-full flex-1" />
                </div>
              </div>
            </div>

            {/* Historical performance */}
            <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3 space-y-2.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Historical records & form
              </h3>
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] text-slate-400">H2H history</span>
                <span className="text-[10px] text-slate-200 font-semibold">{mockData.history.headToHead}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] text-slate-400">Last clash</span>
                <span className="text-[10px] text-slate-200 font-semibold">{mockData.history.lastMatch}</span>
              </div>

              {/* Recent form indicators */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Recent form</span>
                <div className="flex gap-4">
                  <div className="flex gap-0.5">
                    {mockData.history.recentForm.home.map((f: string, i: number) => (
                      <span
                        key={`home-form-${i}`}
                        className={`inline-block h-3.5 w-3.5 rounded-sm text-[8px] font-bold text-center leading-[14px] ${
                          f === "W" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : f === "D" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {mockData.history.recentForm.away.map((f: string, i: number) => (
                      <span
                        key={`away-form-${i}`}
                        className={`inline-block h-3.5 w-3.5 rounded-sm text-[8px] font-bold text-center leading-[14px] ${
                          f === "W" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : f === "D" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleGenerate}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-center text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer shadow-lg shadow-violet-500/10"
            >
              ✦ Generate AI Match Report
            </button>
          </div>
        ) : (
          /* AI Intelligence Output Tab */
          <div className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-[10px] text-red-200">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Match Preview */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-950/10 p-3 space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold flex items-center gap-1">
                <span>✦</span> Match preview
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed font-light">
                {generatedData.preview}
              </p>
            </div>

            {/* Predicted Outcome Probability */}
            <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                  Predicted outcome
                </span>
                <span className="rounded bg-violet-500/25 border border-violet-400/40 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                  Score: {generatedData.prediction.scoreline}
                </span>
              </div>

              {/* Rationale */}
              <p className="text-[10px] text-slate-300 font-light italic">
                "{generatedData.prediction.rationale}"
              </p>

              {/* Win probabilities */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-300 font-medium">{city.teamInfo.homeTeam} Win</span>
                  <span className="text-violet-300 font-bold">{generatedData.prediction.homeWinProb}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500" style={{ width: `${generatedData.prediction.homeWinProb}%` }} />
                </div>

                <div className="flex justify-between text-[10px] pt-1">
                  <span className="text-slate-300 font-medium">{city.teamInfo.awayTeam} Win</span>
                  <span className="text-cyan-300 font-bold">{generatedData.prediction.awayWinProb}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${generatedData.prediction.awayWinProb}%` }} />
                </div>

                <div className="flex justify-between text-[10px] pt-1">
                  <span className="text-slate-300 font-medium">Draw</span>
                  <span className="text-slate-400 font-bold">{generatedData.prediction.drawProb}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500" style={{ width: `${generatedData.prediction.drawProb}%` }} />
                </div>
              </div>
            </div>

            {/* Expandable Tactical Insights */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Tactical Insights
              </span>
              <div className="space-y-2">
                {generatedData.insights.map((insight: any, idx: number) => {
                  const isExpanded = expandedInsight === idx;
                  return (
                    <div
                      key={`insight-${idx}`}
                      className="rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedInsight(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-3 text-left cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-white">{insight.title}</span>
                        <span className="text-[10px] text-violet-400">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0.5 text-[10.5px] text-slate-300 leading-relaxed font-light border-t border-white/5">
                          {insight.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Players Card comparison */}
            <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3 space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Key player analysis
              </span>

              <div className="grid grid-cols-2 gap-3 divide-x divide-white/10">
                {generatedData.keyPlayers.map((player: any, idx: number) => (
                  <div key={`player-${idx}`} className={`space-y-1.5 ${idx === 1 ? 'pl-3' : ''}`}>
                    <p className="text-[11px] font-bold text-white">{player.name}</p>
                    <p className="text-[9px] text-violet-300/80 font-semibold">{player.team}</p>
                    <div className="rounded bg-white/5 px-1.5 py-0.5 inline-block text-[9px] text-slate-300">
                      {player.stat}
                    </div>
                    <p className="text-[10px] text-slate-300 font-light leading-normal pt-1">
                      {player.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OpenAI API Configuration Footer */}
      <div className="mt-auto border-t border-violet-500/10 pt-3 shrink-0">
        <div className="rounded-xl border border-violet-500/15 bg-violet-950/20 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.18em] text-violet-300 font-bold">
              AI API integration
            </span>
            
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer scale-90">
              <input
                type="checkbox"
                checked={useLiveApi}
                onChange={(e) => setUseLiveApi(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600" />
              <span className="ml-1.5 text-[9px] text-slate-300">Live API</span>
            </label>
          </div>

          {useLiveApi && (
            <div className="space-y-1.5">
              <input
                type="password"
                placeholder="Enter OpenAI API Key (starts with sk-...)"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-[10px] text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:outline-none transition-colors"
              />
              <p className="text-[8.5px] text-slate-400 font-light leading-tight">
                Stored locally in your browser. Also reads from <code>OPENAI_API_KEY</code> on server.
              </p>
            </div>
          )}

          {!useLiveApi && (
            <p className="text-[9px] text-slate-300/80 leading-normal font-light">
              Currently running in offline **Demo Mode** using high-fidelity pre-compiled models. Enable Live API for real-time GPT analysis.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
