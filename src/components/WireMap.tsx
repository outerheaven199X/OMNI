import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { Map } from "maplibre-gl";
import { useEffect, useRef } from "react";

type StormPoint = { lat: number; lon: number; name: string };

export default function WireMap({ lat, lon, storms = [] }: { lat: number; lon: number; storms?: StormPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const key = (import.meta as { env?: { VITE_MAPTILER_KEY?: string } }).env?.VITE_MAPTILER_KEY;
    const map = new Map({
      container: ref.current,
      center: [lon, lat],
      zoom: 9,
      dragRotate: false,
      pitch: 0,
      style: {
        version: 8,
        sources: {
          vectiles: {
            type: "vector",
            url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${key}`,
          },
          storms: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: storms
                .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lon))
                .map(s => ({
                  type: "Feature",
                  properties: { name: s.name },
                  geometry: { type: "Point", coordinates: [s.lon, s.lat] as [number, number] }
                })),
            }
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#ffffff" } },
          // administrative boundaries
          {
            id: "boundary",
            type: "line",
            source: "vectiles",
            "source-layer": "boundary",
            paint: { "line-color": "#000", "line-opacity": 0.55, "line-width": 0.6 }
          },
          // roads
          {
            id: "roads",
            type: "line",
            source: "vectiles",
            "source-layer": "transportation",
            paint: {
              "line-color": "#000",
              "line-opacity": 0.55,
              "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.2, 12, 0.6, 15, 1.2]
            }
          },
          // waterways
          {
            id: "waterway",
            type: "line",
            source: "vectiles",
            "source-layer": "waterway",
            paint: { "line-color": "#000", "line-opacity": 0.35, "line-width": 0.5 }
          },
          // storm markers with pulsing effect
          {
            id: "storm-pulse",
            type: "circle",
            source: "storms",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "pulse"],
                0, 8,
                1, 16
              ],
              "circle-color": "#ff0000",
              "circle-opacity": [
                "interpolate",
                ["linear"],
                ["get", "pulse"],
                0, 0.8,
                1, 0.2
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#000",
              "circle-stroke-opacity": 0.6
            }
          },
          {
            id: "storm-center",
            type: "circle",
            source: "storms",
            paint: {
              "circle-radius": 4,
              "circle-color": "#000",
              "circle-opacity": 0.9
            }
          }
        ]
      },
      attributionControl: false
    });

    // grid overlay for extra "wire"
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;inset:0;background-image:linear-gradient(to right, rgba(0,0,0,.12) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,.12) 1px, transparent 1px);background-size:40px 40px,40px 40px;pointer-events:none;";
    map.getContainer().appendChild(overlay);

    // storm pulsing animation
    let animationId: number;
    const animateStorms = () => {
      const time = Date.now() * 0.001;
      const pulseValue = (Math.sin(time * 2) + 1) / 2; // 0 to 1
      
      if (map.getSource('storms')) {
        const source = map.getSource('storms') as maplibregl.GeoJSONSource;
        const data = source._data as { features: Array<{ properties: { name: string; pulse?: number } }> };
        if (data && data.features) {
          data.features.forEach((feature) => {
            feature.properties.pulse = pulseValue;
          });
          source.setData(data);
        }
      }
      
      animationId = requestAnimationFrame(animateStorms);
    };
    
    if (storms.length > 0) {
      animateStorms();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      map.remove();
    };
  }, [lat, lon, storms]);

  return <div ref={ref} className="h-[520px] w-[520px] max-w-full rounded-full border border-black/30 overflow-hidden" />;
}
