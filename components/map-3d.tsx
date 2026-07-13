'use client';

import { useEffect, useRef, useState } from 'react';
import { hostCities, type HostCity } from '@/components/host-city-data';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const MAP_CENTER = {
  lat: 37.5,
  lng: -98.35,
};

const INITIAL_ZOOM = 3.8;

function zoomToRange(zoom: number) {
  return 2000 * Math.pow(2, 15 - zoom);
}

function isWebGL2Available() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

function getCircleCoords(center: { lat: number; lng: number }, radiusKm: number, numPoints: number = 32) {
  const coords = [];
  const kmPerDegreeLat = 111.32;
  const kmPerDegreeLng = 40075 * Math.cos((center.lat * Math.PI) / 180) / 360;

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);

    coords.push({
      lat: center.lat + dy / kmPerDegreeLat,
      lng: center.lng + dx / kmPerDegreeLng,
    });
  }
  coords.push(coords[0]); // close loop
  return coords;
}

const SPONSORS = [
  {
    name: "Nike",
    logo: "⚡",
    cta: "Shop Now ↗",
    tagline: "Just Do It",
    color: "#a855f7", // Violet
  },
  {
    name: "Adidas",
    logo: "▲",
    cta: "Explore ↗",
    tagline: "Impossible is Nothing",
    color: "#22d3ee", // Cyan
  },
  {
    name: "Coca-Cola",
    logo: "🥤",
    cta: "Unlock Deal ↗",
    tagline: "Real Magic",
    color: "#ef4444", // Red
  },
  {
    name: "Visa",
    logo: "💳",
    cta: "Tap to Pay ↗",
    tagline: "Everywhere You Want to Be",
    color: "#3b82f6", // Blue
  }
];

function createBillboardDOMElement(sponsor: typeof SPONSORS[0]) {
  const container = document.createElement("div");
  container.className = "relative p-2 px-3 rounded-xl border bg-slate-950/90 text-white flex flex-col items-center justify-center shadow-lg pointer-events-auto cursor-pointer select-none transition-all duration-300 hover:scale-105";
  
  container.style.borderColor = `${sponsor.color}55`;
  container.style.boxShadow = `0 0 15px ${sponsor.color}25`;
  container.style.minWidth = "120px";
  container.style.textAlign = "center";
  container.style.animation = "float-bob 3s ease-in-out infinite";
  
  const title = document.createElement("div");
  title.className = "flex items-center gap-1.5 justify-center";
  title.style.display = "flex";
  title.style.alignItems = "center";
  title.style.gap = "6px";
  title.style.justifyContent = "center";
  
  const logo = document.createElement("span");
  logo.textContent = sponsor.logo;
  logo.style.color = sponsor.color;
  logo.style.fontSize = "12px";
  
  const name = document.createElement("span");
  name.textContent = sponsor.name;
  name.style.fontSize = "11px";
  name.style.fontWeight = "bold";
  name.style.letterSpacing = "0.05em";
  
  title.appendChild(logo);
  title.appendChild(name);
  container.appendChild(title);
  
  const tagline = document.createElement("div");
  tagline.textContent = sponsor.tagline;
  tagline.style.fontSize = "8px";
  tagline.style.color = "#94a3b8";
  tagline.style.marginTop = "2px";
  tagline.style.textTransform = "uppercase";
  tagline.style.letterSpacing = "0.05em";
  container.appendChild(tagline);

  const cta = document.createElement("div");
  cta.textContent = sponsor.cta;
  cta.style.fontSize = "8px";
  cta.style.color = sponsor.color;
  cta.style.fontWeight = "bold";
  cta.style.marginTop = "6px";
  cta.style.padding = "2px 6px";
  cta.style.borderRadius = "4px";
  cta.style.background = `${sponsor.color}15`;
  cta.style.border = `1px solid ${sponsor.color}35`;
  cta.style.display = "inline-block";
  container.appendChild(cta);

  return container;
}

type Map3DProps = {
  selectedCity: HostCity | null;
  onSelectCity: (city: HostCity) => void;
  onFallbackTo2D?: (fallback: boolean) => void;
  showAdLayer?: boolean;
};

export default function Map3D({ selectedCity, onSelectCity, onFallbackTo2D, showAdLayer = true }: Map3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [use2D, setUse2D] = useState(false);
  const billboardDOMsRef = useRef<HTMLElement[]>([]);
  const showAdLayerRef = useRef(showAdLayer);

  useEffect(() => {
    showAdLayerRef.current = showAdLayer;
  }, [showAdLayer]);

  // Notify parent of fallback status
  useEffect(() => {
    if (use2D) {
      onFallbackTo2D?.(true);
    }
  }, [use2D, onFallbackTo2D]);

  // Show/Hide billboard elements dynamically
  useEffect(() => {
    billboardDOMsRef.current.forEach(dom => {
      if (dom) {
        dom.style.display = showAdLayer ? 'flex' : 'none';
      }
    });
  }, [showAdLayer]);

  // Intercept all console outputs and window errors to catch runtime WebGL compile/link failures from Google Maps WASM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;

    const checkForShaderErrors = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      if (
        message.includes('ION:') ||
        message.includes('Unable to compile') ||
        message.includes('Unable to link') ||
        message.includes('WebGL') ||
        message.includes('WebGL2')
      ) {
        console.warn('WebGL shader compilation failed inside Google Maps WASM. Triggering interactive 2D Map fallback.');
        setUse2D(true);
      }
    };

    console.error = (...args: any[]) => {
      originalConsoleError.apply(console, args);
      checkForShaderErrors(...args);
    };

    console.warn = (...args: any[]) => {
      originalConsoleWarn.apply(console, args);
      checkForShaderErrors(...args);
    };

    console.log = (...args: any[]) => {
      originalConsoleLog.apply(console, args);
      checkForShaderErrors(...args);
    };

    console.info = (...args: any[]) => {
      originalConsoleInfo.apply(console, args);
      checkForShaderErrors(...args);
    };

    const handleContextLoss = () => {
      console.warn('WebGL context lost or failed. Triggering interactive 2D Map fallback.');
      setUse2D(true);
    };
    window.addEventListener('webglcontextcreationerror', handleContextLoss);

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
      console.info = originalConsoleInfo;
      window.removeEventListener('webglcontextcreationerror', handleContextLoss);
    };
  }, []);

  // Check initial WebGL2 support
  useEffect(() => {
    const hasWebGL2 = isWebGL2Available();
    if (!hasWebGL2) {
      setUse2D(true);
    }
  }, []);

  // Initialize the map and markers once (re-runs when use2D status flips)
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          throw new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables.');
        }

        // Configure options for Maps JS Loader
        setOptions({
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          v: 'beta',
        });

        if (use2D) {
          // Fallback to 2D Map
          const { Map } = (await importLibrary('maps')) as any;
          const { AdvancedMarkerElement, PinElement } = (await importLibrary('marker')) as any;

          if (cancelled || !containerRef.current) return;

          containerRef.current.innerHTML = '';
          const map = new Map(containerRef.current, {
            center: { lat: MAP_CENTER.lat, lng: MAP_CENTER.lng },
            zoom: INITIAL_ZOOM,
            mapId: 'DEMO_MAP_ID', // Advanced Markers need a map ID
            gestureHandling: 'greedy',
            disableDefaultUI: false,
          });

          mapRef.current = map;
          initializedRef.current = true;

          // Clear previously stored billboard DOMs
          billboardDOMsRef.current = [];

          // Add 2D markers for each host city
          hostCities.forEach((city, idx) => {
            const pin = new PinElement({
              background: city.accent,
              borderColor: '#f8fafc',
              glyphColor: '#ffffff',
              glyphText: city.id,
              scale: 1.1,
            });

            const marker = new AdvancedMarkerElement({
              map: map,
              position: {
                lat: city.position.lat,
                lng: city.position.lng,
              },
              content: pin,
            });

            const handleMarkerClick = () => {
              onSelectCity(city);
            };

            marker.addListener('gmp-click', handleMarkerClick);

            // Add 2D glowing boundary circle
            new google.maps.Circle({
              strokeColor: city.accent,
              strokeOpacity: 0.85,
              strokeWeight: 2,
              fillColor: city.accent,
              fillOpacity: 0.12,
              map: map,
              center: city.position,
              radius: 400, // 400 meters radius
            });

            // Sponsor billboards for 2D Fallback
            const citySponsors = [SPONSORS[idx % SPONSORS.length], SPONSORS[(idx + 1) % SPONSORS.length]];
            
            citySponsors.forEach((sponsor, sIdx) => {
              const offsetLat = sIdx === 0 ? 0.0012 : -0.0012;
              const offsetLng = sIdx === 0 ? -0.0012 : 0.0012;
              
              const billboardDOM = createBillboardDOMElement(sponsor);
              billboardDOM.style.display = showAdLayerRef.current ? 'flex' : 'none';
              billboardDOMsRef.current.push(billboardDOM);
              
              new AdvancedMarkerElement({
                map: map,
                position: {
                  lat: city.position.lat + offsetLat,
                  lng: city.position.lng + offsetLng,
                },
                content: billboardDOM,
              });
            });
          });

          return;
        }

        // Import libraries needed for 3D maps and markers
        const { Map3DElement, Marker3DInteractiveElement, Polygon3DElement } = 
          (await importLibrary('maps3d')) as any;
        const { PinElement } = 
          (await importLibrary('marker')) as any;

        if (cancelled || !containerRef.current) return;

        // Instantiate Map3DElement using string literals to avoid undefined namespace enums
        const map = new Map3DElement({
          center: {
            lat: MAP_CENTER.lat,
            lng: MAP_CENTER.lng,
            altitude: 0,
          },
          range: zoomToRange(INITIAL_ZOOM),
          tilt: 50,
          heading: 0,
          mode: 'HYBRID',
          gestureHandling: 'GREEDY',
        });

        map.style.width = '100%';
        map.style.height = '100%';

        // Clear container and append the map
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(map);
        mapRef.current = map;
        initializedRef.current = true;

        // Clear previously stored billboard DOMs
        billboardDOMsRef.current = [];

        // Add 3D markers for each host city
        hostCities.forEach((city, idx) => {
          const pin = new PinElement({
            background: city.accent,
            borderColor: '#f8fafc',
            glyphColor: '#ffffff',
            glyphText: city.id,
            scale: 1.1,
          });

          const marker = new Marker3DInteractiveElement({
            position: {
              lat: city.position.lat,
              lng: city.position.lng,
              altitude: 200, // Raised to create a nice 3D floating effect with the line
            },
            altitudeMode: 'RELATIVE_TO_GROUND',
            extruded: true,
          });

          marker.append(pin);

          // Listen for clicks on the 3D marker
          const handleMarkerClick = () => {
            onSelectCity(city);
          };

          marker.addEventListener('gmp-click', handleMarkerClick);
          marker.addEventListener('click', handleMarkerClick);

          map.append(marker);

          // Add a 3D Glowing boundary ring
          const boundaryCoords = getCircleCoords(city.position, 0.4); // 400m radius
          const boundary = new Polygon3DElement({
            path: boundaryCoords,
            fillColor: `${city.accent}22`, // 13% opacity
            strokeColor: city.accent,
            strokeWidth: 3,
            extruded: false, // Flat on ground
            altitudeMode: 'CLAMP_TO_GROUND',
            drawsOccludedSegments: true,
          });

          map.append(boundary);

          // Sponsor billboards
          const citySponsors = [SPONSORS[idx % SPONSORS.length], SPONSORS[(idx + 1) % SPONSORS.length]];
          
          citySponsors.forEach((sponsor, sIdx) => {
            const offsetLat = sIdx === 0 ? 0.0012 : -0.0012;
            const offsetLng = sIdx === 0 ? -0.0012 : 0.0012;
            
            const billboardDOM = createBillboardDOMElement(sponsor);
            billboardDOM.style.display = showAdLayerRef.current ? 'flex' : 'none';
            billboardDOMsRef.current.push(billboardDOM);
            
            const billboardMarker = new Marker3DInteractiveElement({
              position: {
                lat: city.position.lat + offsetLat,
                lng: city.position.lng + offsetLng,
                altitude: 100, // Float at 100m altitude
              },
              altitudeMode: 'RELATIVE_TO_GROUND',
            });
            
            billboardMarker.append(billboardDOM);
            map.append(billboardMarker);
          });
        });

        // Trigger camera fly to the initial selected city after a short delay (only if one is selected)
        setTimeout(() => {
          if (cancelled || !mapRef.current) return;
          if (selectedCity) {
            mapRef.current.flyCameraTo({
              endCamera: {
                center: {
                  lat: selectedCity.position.lat,
                  lng: selectedCity.position.lng,
                  altitude: 0,
                },
                range: zoomToRange(selectedCity.camera.zoom),
                tilt: selectedCity.camera.tilt,
                heading: selectedCity.camera.heading,
              },
              durationMillis: 2500,
            });
          }
        }, 1200);

      } catch (err: any) {
        console.error('Failed to initialize 3D Map:', err);
        // If 3D initialization throws an error, trigger 2D fallback
        setUse2D(true);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          if (typeof mapRef.current.remove === 'function') {
            mapRef.current.remove();
          }
        } catch (e) {
          // Ignore removal errors on unmount
        }
        mapRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [use2D]);

  // Fly/Pan to selected city when it changes
  useEffect(() => {
    if (!initializedRef.current || !mapRef.current) return;

    try {
      if (use2D) {
        if (selectedCity) {
          mapRef.current.panTo({
            lat: selectedCity.position.lat,
            lng: selectedCity.position.lng,
          });
          mapRef.current.setZoom(11);
        } else {
          mapRef.current.panTo({
            lat: MAP_CENTER.lat,
            lng: MAP_CENTER.lng,
          });
          mapRef.current.setZoom(INITIAL_ZOOM);
        }
      } else {
        if (selectedCity) {
          mapRef.current.flyCameraTo({
            endCamera: {
              center: {
                lat: selectedCity.position.lat,
                lng: selectedCity.position.lng,
                altitude: 0,
              },
              range: zoomToRange(selectedCity.camera.zoom),
              tilt: selectedCity.camera.tilt,
              heading: selectedCity.camera.heading,
            },
            durationMillis: 2000,
          });
        } else {
          mapRef.current.flyCameraTo({
            endCamera: {
              center: {
                lat: MAP_CENTER.lat,
                lng: MAP_CENTER.lng,
                altitude: 0,
              },
              range: zoomToRange(INITIAL_ZOOM),
              tilt: 50,
              heading: 0,
            },
            durationMillis: 2000,
          });
        }
      }
    } catch (e) {
      console.warn('Map camera update failed:', e);
    }
  }, [selectedCity, use2D]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative bg-slate-950 flex items-center justify-center"
      style={{
        width: '100%',
        height: '100vh',
      }}
    >
      {errorMessage ? (
        <div className="absolute z-30 max-w-md rounded-2xl border border-red-500/35 bg-slate-950/90 p-5 text-sm text-red-200 backdrop-blur-lg shadow-2xl">
          <p className="font-semibold text-red-400 mb-2 flex items-center gap-2 text-base">
            ⚠️ Map Loading Error
          </p>
          <p className="text-slate-300 leading-relaxed">{errorMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-cyan-300/80 text-xs tracking-widest uppercase">
            {use2D ? "Loading Interactive 2D Map..." : "Loading Photorealistic 3D Map..."}
          </p>
        </div>
      )}
    </div>
  );
}
