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

type Map3DProps = {
  selectedCity: HostCity;
  onSelectCity: (city: HostCity) => void;
};

export default function Map3D({ selectedCity, onSelectCity }: Map3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize the map and markers once
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

        // Import libraries needed for 3D maps and markers
        const { Map3DElement, Marker3DInteractiveElement } = 
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

        // Add 3D markers for each host city
        hostCities.forEach((city) => {
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
        setErrorMessage(err.message || 'An error occurred while loading the 3D Map. Make sure your API key is valid and has billing enabled.');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore removal errors on unmount
        }
        mapRef.current = null;
      }
      initializedRef.current = false;
    };
  }, []);

  // Fly to selected city when it changes
  useEffect(() => {
    if (!initializedRef.current || !mapRef.current) return;

    try {
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
    } catch (e) {
      console.warn('flyCameraTo failed:', e);
    }
  }, [selectedCity]);

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
            ⚠️ 3D Map Loading Error
          </p>
          <p className="text-slate-300 leading-relaxed">{errorMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-cyan-300/80 text-xs tracking-widest uppercase">Loading Photorealistic 3D Map...</p>
        </div>
      )}
    </div>
  );
}
