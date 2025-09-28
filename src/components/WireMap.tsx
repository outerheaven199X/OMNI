import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { Map } from "maplibre-gl";
import { useEffect, useRef } from "react";

type StormPoint = { lat: number; lon: number; name: string };

export default function WireMap({ lat, lon, zoom = 9, storms = [] }: { lat: number; lon: number; zoom?: number; storms?: StormPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const key = (import.meta as { env?: { VITE_MAPTILER_KEY?: string } }).env?.VITE_MAPTILER_KEY;
    if (!key) {
      ref.current.innerHTML =
        '<div style="display:grid;place-items:center;height:520px;width:520px;border:1px solid #000;border-radius:9999px">\
           <div style="font:12px/1.3 IBM Plex Mono,monospace;text-align:center">MapTiler key missing<br/><code>VITE_MAPTILER_KEY</code></div>\
         </div>';
      return;
    }
                const map = new Map({
                  container: ref.current,
                  center: [lon, lat],
                  zoom: zoom,
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
          // Background
          { id: "bg", type: "background", paint: { "background-color": "#f8f9fa" } },
          
          // Water bodies with blue shading (40% opacity)
          {
            id: "water-fill",
            type: "fill",
            source: "vectiles",
            "source-layer": "water",
            paint: { 
              "fill-color": "rgba(135, 206, 235, 0.4)",
              "fill-outline-color": "rgba(0, 100, 200, 0.4)"
            }
          },
          
          // Land areas with subtle green shading (40% opacity)
          {
            id: "land-fill",
            type: "fill",
            source: "vectiles",
            "source-layer": "landcover",
            paint: { 
              "fill-color": "rgba(34, 139, 34, 0.4)",
              "fill-outline-color": "rgba(0, 100, 0, 0.4)"
            }
          },
          
          // State/Administrative boundaries only (no roads)
          {
            id: "boundary",
            type: "line",
            source: "vectiles",
            "source-layer": "boundary",
            paint: { "line-color": "#000", "line-opacity": 0.4, "line-width": 1.0 }
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
                0, 10,
                1, 20
              ],
              "circle-color": "#ff4444",
              "circle-opacity": [
                "interpolate",
                ["linear"],
                ["get", "pulse"],
                0, 0.7,
                1, 0.1
              ],
              "circle-stroke-width": 3,
              "circle-stroke-color": "#cc0000",
              "circle-stroke-opacity": 0.8
            }
          },
          {
            id: "storm-center",
            type: "circle",
            source: "storms",
            paint: {
              "circle-radius": 6,
              "circle-color": "#ff0000",
              "circle-opacity": 0.9,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#000",
              "circle-stroke-opacity": 1
            }
          }
        ]
      },
      attributionControl: false
    });

    // grid overlay for extra "wire" aesthetic (40% opacity)
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;inset:0;background-image:linear-gradient(to right, rgba(0,0,0,.4) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,.4) 1px, transparent 1px);background-size:30px 30px,30px 30px;pointer-events:none;z-index:1;";
    map.getContainer().appendChild(overlay);

    // storm pulsing animation
    let animationId: number;
    const animateStorms = () => {
      const time = Date.now() * 0.001;
      const pulseValue = (Math.sin(time * 2) + 1) / 2; // 0 to 1
      
      if (map.getSource('storms')) {
        const source = map.getSource('storms') as maplibregl.GeoJSONSource;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = source._data as any;
        if (data && data.features) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.features.forEach((feature: any) => {
            if (feature.properties) {
              feature.properties.pulse = pulseValue;
            }
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
  }, [lat, lon, zoom, storms]);

  return <div ref={ref} className="h-[600px] w-[600px] max-w-full rounded-full border border-black/30 overflow-hidden" />;
}
