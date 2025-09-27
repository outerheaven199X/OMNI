import "maplibre-gl/dist/maplibre-gl.css";
import { Map } from "maplibre-gl";
import { useEffect, useRef } from "react";

export default function WireMap({ lat, lon }: { lat: number; lon: number }) {
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

    return () => map.remove();
  }, [lat, lon]);

  return <div ref={ref} className="h-[520px] w-[520px] max-w-full rounded-full border border-black/30 overflow-hidden" />;
}
