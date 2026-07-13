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

function createHotAirBalloonAd(sponsor: typeof SPONSORS[0]) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "130");
  svg.setAttribute("height", "140");
  svg.setAttribute("viewBox", "0 0 130 140");
  svg.style.overflow = "visible";
  svg.style.filter = `drop-shadow(0 0 12px ${sponsor.color}35)`;
  svg.style.cursor = "pointer";

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  // Balloon envelope gradient
  const balloonGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  balloonGrad.setAttribute("id", `balloon-grad-${sponsor.name}`);
  balloonGrad.setAttribute("x1", "0%");
  balloonGrad.setAttribute("y1", "0%");
  balloonGrad.setAttribute("x2", "0%");
  balloonGrad.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", sponsor.color);
  
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "80%");
  stop2.setAttribute("stop-color", `${sponsor.color}77`);

  const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop3.setAttribute("offset", "100%");
  stop3.setAttribute("stop-color", "#0f172a");

  balloonGrad.appendChild(stop1);
  balloonGrad.appendChild(stop2);
  balloonGrad.appendChild(stop3);
  defs.appendChild(balloonGrad);

  // Flame burner gradient
  const flameGrad = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
  flameGrad.setAttribute("id", "flame-grad");
  
  const fStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  fStop1.setAttribute("offset", "0%");
  fStop1.setAttribute("stop-color", "#fb923c");
  
  const fStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  fStop2.setAttribute("offset", "100%");
  fStop2.setAttribute("stop-color", "transparent");

  flameGrad.appendChild(fStop1);
  flameGrad.appendChild(fStop2);
  defs.appendChild(flameGrad);

  svg.appendChild(defs);

  // 1. Balloon Envelope Path
  const envelope = document.createElementNS("http://www.w3.org/2000/svg", "path");
  envelope.setAttribute("d", "M 65,10 C 30,10 30,52 50,68 L 50,75 L 80,75 L 80,68 C 100,52 100,10 65,10 Z");
  envelope.setAttribute("fill", `url(#balloon-grad-${sponsor.name})`);
  envelope.setAttribute("stroke", `${sponsor.color}bb`);
  envelope.setAttribute("stroke-width", "1.5");
  svg.appendChild(envelope);

  // 2. Stripe overlays
  const stripeLeft = document.createElementNS("http://www.w3.org/2000/svg", "path");
  stripeLeft.setAttribute("d", "M 65,10 C 42,10 40,52 50,75 M 65,10 C 52,10 50,52 60,75");
  stripeLeft.setAttribute("fill", "none");
  stripeLeft.setAttribute("stroke", "rgba(255,255,255,0.15)");
  stripeLeft.setAttribute("stroke-width", "1");
  svg.appendChild(stripeLeft);

  const stripeRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
  stripeRight.setAttribute("d", "M 65,10 C 88,10 90,52 80,75 M 65,10 C 78,10 80,52 70,75");
  stripeRight.setAttribute("fill", "none");
  stripeRight.setAttribute("stroke", "rgba(255,255,255,0.15)");
  stripeRight.setAttribute("stroke-width", "1");
  svg.appendChild(stripeRight);

  // 3. Burner Flame Glow
  const flame = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  flame.setAttribute("points", "60,75 65,82 70,75");
  flame.setAttribute("fill", "url(#flame-grad)");
  svg.appendChild(flame);

  // 4. Connecting Ropes
  const ropeLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
  ropeLeft.setAttribute("x1", "53");
  ropeLeft.setAttribute("y1", "75");
  ropeLeft.setAttribute("x2", "58");
  ropeLeft.setAttribute("y2", "88");
  ropeLeft.setAttribute("stroke", "#94a3b8");
  ropeLeft.setAttribute("stroke-width", "0.75");
  svg.appendChild(ropeLeft);

  const ropeRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
  ropeRight.setAttribute("x1", "77");
  ropeRight.setAttribute("y1", "75");
  ropeRight.setAttribute("x2", "72");
  ropeRight.setAttribute("y2", "88");
  ropeRight.setAttribute("stroke", "#94a3b8");
  ropeRight.setAttribute("stroke-width", "0.75");
  svg.appendChild(ropeRight);

  // 5. Basket
  const basket = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  basket.setAttribute("x", "57");
  basket.setAttribute("y", "88");
  basket.setAttribute("width", "16");
  basket.setAttribute("height", "11");
  basket.setAttribute("rx", "2");
  basket.setAttribute("fill", "#78350f");
  basket.setAttribute("stroke", "#451a03");
  basket.setAttribute("stroke-width", "1");
  svg.appendChild(basket);

  // 6. Premium Glassmorphic Badge Overlay on the balloon face
  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("x", "38");
  foreignObject.setAttribute("y", "20");
  foreignObject.setAttribute("width", "54");
  foreignObject.setAttribute("height", "45");

  const htmlContainer = document.createElement("div");
  htmlContainer.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  htmlContainer.className = "flex flex-col items-center justify-center h-full w-full rounded-lg bg-slate-950/80 border border-white/10 p-1 text-center shadow-md select-none transition-all duration-300";
  htmlContainer.style.borderColor = `${sponsor.color}44`;
  htmlContainer.style.boxShadow = `0 4px 10px ${sponsor.color}15`;

  const logo = document.createElement("span");
  logo.textContent = sponsor.logo;
  logo.style.color = sponsor.color;
  logo.style.fontSize = "12px";
  logo.style.lineHeight = "1";
  htmlContainer.appendChild(logo);

  const name = document.createElement("span");
  name.textContent = sponsor.name;
  name.style.fontSize = "8px";
  name.style.fontWeight = "bold";
  name.style.color = "white";
  name.style.letterSpacing = "0.05em";
  name.style.marginTop = "2px";
  htmlContainer.appendChild(name);

  const cta = document.createElement("span");
  cta.textContent = sponsor.cta;
  cta.style.fontSize = "6px";
  cta.style.color = sponsor.color;
  cta.style.fontWeight = "bold";
  cta.style.marginTop = "4px";
  cta.style.padding = "1px 4px";
  cta.style.borderRadius = "2px";
  cta.style.background = `${sponsor.color}20`;
  cta.style.border = `1px solid ${sponsor.color}40`;
  cta.style.textTransform = "uppercase";
  cta.style.letterSpacing = "0.02em";
  htmlContainer.appendChild(cta);

  foreignObject.appendChild(htmlContainer);
  svg.appendChild(foreignObject);

  return svg;
}

type Map3DProps = {
  selectedCity: HostCity | null;
  onSelectCity: (city: HostCity) => void;
  onFallbackTo2D?: (fallback: boolean) => void;
  showAdLayer?: boolean;
  cities: HostCity[];
};

export default function Map3D({ selectedCity, onSelectCity, onFallbackTo2D, showAdLayer = true, cities }: Map3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [use2D, setUse2D] = useState(false);
  
  const billboardDOMsRef = useRef<any[]>([]);
  const showAdLayerRef = useRef(showAdLayer);
  
  // Track dynamically loaded stadium markers, boundaries, and billboards to show/hide reactively
  const stadiumMarkersRef = useRef<{ [cityId: string]: any }>({});
  const boundariesRef = useRef<{ [cityId: string]: any }>({});
  const billboardsByCityRef = useRef<{ [cityId: string]: any[] }>({});

  useEffect(() => {
    showAdLayerRef.current = showAdLayer;
  }, [showAdLayer]);

  // Notify parent of fallback status
  useEffect(() => {
    if (use2D) {
      onFallbackTo2D?.(true);
    }
  }, [use2D, onFallbackTo2D]);

  // Show/Hide billboard elements dynamically based on ad layer toggle and active city filters
  useEffect(() => {
    if (!initializedRef.current) return;
    const activeIds = new Set(cities.map(c => c.id));

    hostCities.forEach((city) => {
      const active = activeIds.has(city.id);
      const billboards = billboardsByCityRef.current[city.id] || [];
      
      billboards.forEach(billboard => {
        if (billboard) {
          const is3D = billboard.localName === 'gmp-marker-3d-interactive';
          const shouldShow = active && showAdLayer;
          billboard.style.display = shouldShow ? (is3D ? 'block' : 'flex') : 'none';
        }
      });
    });
  }, [showAdLayer, cities]);

  // Show/Hide stadium markers and boundaries dynamically based on active filters
  useEffect(() => {
    if (!initializedRef.current || !mapRef.current) return;
    const activeIds = new Set(cities.map(c => c.id));

    hostCities.forEach((city) => {
      const active = activeIds.has(city.id);

      // Stadium Marker visibility
      const marker = stadiumMarkersRef.current[city.id];
      if (marker) {
        if (marker.content) {
          marker.content.style.display = active ? 'block' : 'none';
        } else {
          marker.style.display = active ? 'block' : 'none';
        }
      }

      // Boundary visibility
      const boundary = boundariesRef.current[city.id];
      if (boundary) {
        if (typeof boundary.setMap === 'function') {
          boundary.setMap(active ? mapRef.current : null);
        } else {
          boundary.style.display = active ? 'block' : 'none';
        }
      }
    });
  }, [cities]);

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

          // Clear previously stored billboard DOMs and markers
          billboardDOMsRef.current = [];
          stadiumMarkersRef.current = {};
          boundariesRef.current = {};
          billboardsByCityRef.current = {};

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

            // Save stadium marker ref and set initial display
            stadiumMarkersRef.current[city.id] = marker;
            const isActiveCity = cities.some(c => c.id === city.id);
            pin.style.display = isActiveCity ? 'block' : 'none';

            const handleMarkerClick = () => {
              onSelectCity(city);
            };

            marker.addListener('gmp-click', handleMarkerClick);

            // Add 2D glowing boundary circle
            const circle = new google.maps.Circle({
              strokeColor: city.accent,
              strokeOpacity: 0.85,
              strokeWeight: 2,
              fillColor: city.accent,
              fillOpacity: 0.12,
              map: isActiveCity ? map : null,
              center: city.position,
              radius: 400, // 400 meters radius
            });
            boundariesRef.current[city.id] = circle;

            // Sponsor billboards for 2D Fallback
            const citySponsors = [SPONSORS[idx % SPONSORS.length], SPONSORS[(idx + 1) % SPONSORS.length]];
            billboardsByCityRef.current[city.id] = [];
            
            citySponsors.forEach((sponsor, sIdx) => {
              const offsetLat = sIdx === 0 ? 0.0012 : -0.0012;
              const offsetLng = sIdx === 0 ? -0.0012 : 0.0012;
              
              const billboardSVG = createHotAirBalloonAd(sponsor);
              billboardSVG.style.animation = "float-bob 3.5s ease-in-out infinite";
              if (sIdx === 1) billboardSVG.style.animationDelay = "1.7s";
              
              billboardSVG.style.display = (showAdLayerRef.current && isActiveCity) ? 'block' : 'none';
              billboardDOMsRef.current.push(billboardSVG);
              billboardsByCityRef.current[city.id].push(billboardSVG);
              
              new AdvancedMarkerElement({
                map: map,
                position: {
                  lat: city.position.lat + offsetLat,
                  lng: city.position.lng + offsetLng,
                },
                content: billboardSVG,
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

        // Clear previously stored billboard DOMs and markers
        billboardDOMsRef.current = [];
        stadiumMarkersRef.current = {};
        boundariesRef.current = {};
        billboardsByCityRef.current = {};

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

          // Save stadium marker ref and set initial display
          stadiumMarkersRef.current[city.id] = marker;
          const isActiveCity = cities.some(c => c.id === city.id);
          marker.style.display = isActiveCity ? 'block' : 'none';

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

          // Save boundary ref and set initial display
          boundariesRef.current[city.id] = boundary;
          boundary.style.display = isActiveCity ? 'block' : 'none';

          map.append(boundary);

          // Sponsor billboards
          const citySponsors = [SPONSORS[idx % SPONSORS.length], SPONSORS[(idx + 1) % SPONSORS.length]];
          billboardsByCityRef.current[city.id] = [];
          
          citySponsors.forEach((sponsor, sIdx) => {
            const offsetLat = sIdx === 0 ? 0.0012 : -0.0012;
            const offsetLng = sIdx === 0 ? -0.0012 : 0.0012;
            
            const billboardSVG = createHotAirBalloonAd(sponsor);
            const template = document.createElement("template");
            template.content.appendChild(billboardSVG);
            
            const billboardMarker = new Marker3DInteractiveElement({
              position: {
                lat: city.position.lat + offsetLat,
                lng: city.position.lng + offsetLng,
                altitude: 125, // Float high like a real hot air balloon
              },
              altitudeMode: 'RELATIVE_TO_GROUND',
            });
            
            billboardMarker.append(template);
            billboardMarker.style.animation = "float-bob 3.5s ease-in-out infinite";
            if (sIdx === 1) billboardMarker.style.animationDelay = "1.7s";
            
            billboardMarker.style.display = (showAdLayerRef.current && isActiveCity) ? 'block' : 'none';
            billboardDOMsRef.current.push(billboardMarker);
            billboardsByCityRef.current[city.id].push(billboardMarker);
            
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
