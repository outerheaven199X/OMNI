import React, { useEffect, useState } from "react";
import {
  fetchDailyWeather,
  fetchAirQualityNow,
  codeToIcon,
  type DailyWeather,
  type AirQualityNow,
  fetchGdeltNews,
  type GdeltArticle,
  fetchNwsAlerts,
  type NwsAlert,
  fetchNhcCurrentStorms,
  type NhcStorm,
} from "./lib/api";
import {
  fetchMoonPhase,
  type MoonPhase,
  fetchEarthquakes,
  type Earthquake,
  fetchSolarActivity,
  type SolarActivity,
  fetchUVIndex,
  type UVIndex,
  fetchPollenCount,
  type PollenCount,
  fetchWildfires,
  type Wildfire,
  fetchFloodWarnings,
  type FloodWarning,
  fetchTideData,
  type TideData,
} from "./lib/enhanced-api";
import WireMap from "./components/WireMap";

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-black/20 bg-white p-3 shadow-sm">
      <h3 className="mb-2 font-mono text-sm font-bold tracking-wide">{title}</h3>
      {children}
    </section>
  );
}


export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("NEW YORK CITY, NY");
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 40.7128, lon: -74.0060 });
  const [wx, setWx] = useState<DailyWeather | null>(null);
  const [aq, setAq] = useState<AirQualityNow | null>(null);
  const [alerts, setAlerts] = useState<NwsAlert[] | null>(null);
  const [storms, setStorms] = useState<NhcStorm[] | null>(null);
  const [news, setNews] = useState<GdeltArticle[] | null>(null);
  const [loading, setLoading] = useState<"idle" | "both" | "done">("idle");
  const [mapZoom, setMapZoom] = useState(9);
  
  // New enhanced data states
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null);
  const [earthquakes, setEarthquakes] = useState<Earthquake[] | null>(null);
  const [solarActivity, setSolarActivity] = useState<SolarActivity | null>(null);
  const [uvIndex, setUvIndex] = useState<UVIndex | null>(null);
  const [pollenCount, setPollenCount] = useState<PollenCount | null>(null);
  const [wildfires, setWildfires] = useState<Wildfire[] | null>(null);
  const [floodWarnings, setFloodWarnings] = useState<FloodWarning[] | null>(null);
  const [tideData, setTideData] = useState<TideData[] | null>(null);
  const [buildId] = useState(() => new Date().toISOString());

  // use Open-Meteo's free geocoder (no key, good CORS)
  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
      const r = await fetch(url);
      const j = await r.json();
      const g = j?.results?.[0];
      if (g) {
        const name = [g.name, g.admin1, g.country_code].filter(Boolean).join(", ");
        setCity(name.toUpperCase());
        setCoords({ lat: g.latitude, lon: g.longitude });
      } else {
        setCity(q.toUpperCase());
      }
    } catch { setCity(q.toUpperCase()); }
  }

  // load on coords change
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading("both");
        const [
          w, a, al, st, moon, quakes, solar, uv, pollen, fires, floods, tides
        ] = await Promise.all([
          fetchDailyWeather(coords.lat, coords.lon),
          fetchAirQualityNow(coords.lat, coords.lon),
          fetchNwsAlerts(coords.lat, coords.lon),
          fetchNhcCurrentStorms(),
          fetchMoonPhase(),
          fetchEarthquakes(),
          fetchSolarActivity(),
          fetchUVIndex(coords.lat, coords.lon),
          fetchPollenCount(coords.lat, coords.lon),
          fetchWildfires(),
          fetchFloodWarnings(),
          fetchTideData(coords.lat, coords.lon),
        ]);
        if (!cancel) {
          setWx(w);
          setAq(a);
          setAlerts(al);
          setStorms(st);
          setMoonPhase(moon);
          setEarthquakes(quakes);
          setSolarActivity(solar);
          setUvIndex(uv);
          setPollenCount(pollen);
          setWildfires(fires);
          setFloodWarnings(floods);
          setTideData(tides);
        }
      } catch {
        if (!cancel) {
          setWx(null); setAq(null); setAlerts(null); setStorms(null);
          setMoonPhase(null); setEarthquakes(null); setSolarActivity(null);
          setUvIndex(null); setPollenCount(null); setWildfires(null);
          setFloodWarnings(null); setTideData(null);
        }
      } finally {
        if (!cancel) setLoading("done");
      }
    })();
    return () => { cancel = true; };
  }, [coords.lat, coords.lon]);

  // GDELT news by city name
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!city || city === "CITY") { 
        // Show global weather news when no city selected
        const items = await fetchGdeltNews("");
        if (!cancel) setNews(items);
        return; 
      }
      const short = city.split(",")[0]; // strip long "Place, Region"
      const items = await fetchGdeltNews(short);
      if (!cancel) setNews(items);
    })();
    return () => { cancel = true; };
  }, [city]);

  return (
    <div className="relative min-h-screen bg-white text-black">
      <div className="pointer-events-none fixed inset-0 -z-50 dot-matrix" />
      <div className="scanline" />
      {/* HEADER */}
      <header className="mx-auto w-full max-w-[1420px] px-4 pt-4">
        <div className="mb-2 text-[11px] opacity-60">BUILD ID: {buildId}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-wide antimeme-font">OMNI<span className="cursor-blink"></span></div>
            <div className="text-xs opacity-60 antimeme-font">weather ops</div>
          </div>
          <form onSubmit={onSearch} className="flex items-center gap-2 antimeme-box">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="zip or city…"
              className="w-[36vw] max-w-[420px] bg-transparent antimeme-font text-xs outline-none placeholder:text-black/40"
            />
            <button className="antimeme-button text-[11px]">
              ENTER
            </button>
          </form>
        </div>
        <div className="ascii-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </header>

      {/* LAYOUT: left sidebar / center wiremap / right sidebar */}
      <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 pb-10 pt-4 lg:grid-cols-[300px_1fr_300px]">
        {/* LEFT SIDEBAR */}
        <div className="grid content-start gap-4">
          <Section title="CURRENT CONDITIONS">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">Location</span>
                <span className="text-[11px] opacity-70">{city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">Coordinates</span>
                <span className="text-[11px] opacity-70">{coords.lat.toFixed(2)}, {coords.lon.toFixed(2)}</span>
              </div>
            </div>
          </Section>

          <Section title="MOON CYCLE">
            {moonPhase === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{moonPhase.phase}</span>
                  <span className="text-[11px] opacity-70">{moonPhase.illumination}%</span>
                </div>
                <div className="text-[11px] opacity-60">
                  Next Full: {moonPhase.nextFullMoon}
                </div>
                <div className="text-[11px] opacity-60">
                  Next New: {moonPhase.nextNewMoon}
                </div>
              </div>
            )}
          </Section>

          <Section title="SOLAR ACTIVITY">
            {solarActivity === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">Kp Index</span>
                  <span className="text-[11px] opacity-70">{solarActivity.kpIndex}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">Solar Wind</span>
                  <span className="text-[11px] opacity-70">{solarActivity.solarWindSpeed} km/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">Storm</span>
                  <span className="text-[11px] opacity-70">{solarActivity.geomagneticStorm ? "Active" : "Quiet"}</span>
                </div>
              </div>
            )}
          </Section>

          <Section title="UV INDEX & POLLEN">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">UV Index</span>
                <span className="text-[11px] opacity-70">{uvIndex?.index || "—"} ({uvIndex?.risk || "Unknown"})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">Pollen</span>
                <span className="text-[11px] opacity-70">{pollenCount?.overall || "—"}</span>
              </div>
            </div>
          </Section>

          <Section title="GLOBAL AVERAGE TEMP">
            <div className="text-2xl font-bold">+1.27°C</div>
            <div className="text-xs opacity-60">vs 1991–2020 baseline</div>
          </Section>

          <Section title="AIR QUALITY — NOW">
            {!aq ? (
              <div className="p-4 text-center text-xs opacity-60">loading…</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  ["AQI", aq.aqi !== null ? String(Math.round(aq.aqi)) : "—"],
                  ["PM2.5", aq.pm25 !== null ? `${Math.round(aq.pm25)} µg/m³` : "—"],
                  ["PM10", aq.pm10 !== null ? `${Math.round(aq.pm10)} µg/m³` : "—"],
                  ["O₃", aq.o3 !== null ? `${Math.round(aq.o3)} µg/m³` : "—"],
                  ["NO₂", aq.no2 !== null ? `${Math.round(aq.no2)} µg/m³` : "—"],
                  ["SO₂", aq.so2 !== null ? `${Math.round(aq.so2)} µg/m³` : "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-lg border border-black/20 p-2 text-center">
                    <div className="font-semibold">{k}</div>
                    <div className="opacity-70">{v as string}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* CENTER - WIREMAP & FORECAST */}
        <div className="flex flex-col items-center gap-6">
          {/* CITY NAME */}
          <div className="text-center">
            <div className="text-xl font-bold antimeme-font">{city}</div>
            <div className="text-sm opacity-70 antimeme-font">{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</div>
          </div>

          {/* WIREMAP */}
          <div className="rounded-2xl border border-black/20 bg-white p-4 shadow-sm relative">
            <div className="grid place-items-center">
              <WireMap
                lat={coords.lat}
                lon={coords.lon}
                zoom={mapZoom}
                storms={storms?.filter(s => s.lat && s.lon).map(s => ({
                  lat: s.lat!,
                  lon: s.lon!,
                  name: s.name
                })) || []}
              />
            </div>
            {/* ZOOM CONTROLS */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
              <button
                onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
                className="antimeme-button text-xs w-8 h-8"
              >
                +
              </button>
              <button
                onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
                className="antimeme-button text-xs w-8 h-8"
              >
                −
              </button>
            </div>
          </div>

          {/* 5-DAY FORECAST */}
          <Section title={`${city} — 5-DAY FORECAST`}>
            {loading === "idle" && !wx ? (
              <div className="p-4 text-center text-xs opacity-60">enter a city or zip</div>
            ) : !wx ? (
              <div className="p-4 text-center text-xs opacity-60">loading…</div>
            ) : (
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                {wx.date.slice(0, 5).map((d, i) => (
                  <div key={d} className="rounded-lg border border-black/20 p-3">
                    <div className="font-semibold">{new Date(d).toLocaleDateString([], { weekday: "short" })}</div>
                    <div className="opacity-70">H {Math.round(wx.tmax[i])}°</div>
                    <div className="opacity-70">L {Math.round(wx.tmin[i])}°</div>
                    <div className="opacity-80">{codeToIcon(wx.code[i])}</div>
                    <div className="opacity-60">{wx.precip[i] ? `${Math.round(wx.precip[i])} mm` : "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="grid content-start gap-4">
          <Section title="WEATHER NEWS">
            {news === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : news.length === 0 ? (
              <div className="text-xs opacity-60">No recent items</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {news.slice(0, 4).map((n) => (
                  <li key={n.url} className="leading-snug">
                    <a className="underline hover:no-underline" href={n.url} target="_blank" rel="noreferrer">
                      {n.title}
                    </a>
                    <div className="text-[11px] opacity-60">
                      {n.domain} • {n.seendate ? new Date(n.seendate).toLocaleDateString() : "Date unknown"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="EARTHQUAKES (24H)">
            {earthquakes === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : earthquakes.length === 0 ? (
              <div className="text-xs opacity-60">No recent earthquakes</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {earthquakes.slice(0, 4).map((eq) => (
                  <li key={eq.id} className="flex items-center justify-between rounded border border-black/15 px-2 py-1">
                    <span className="font-mono text-xs">M{eq.magnitude}</span>
                    <span className="text-[11px] opacity-70">{eq.place.split(',')[0]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="WILDFIRES (ACTIVE)">
            {wildfires === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : wildfires.length === 0 ? (
              <div className="text-xs opacity-60">No active wildfires</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {wildfires.slice(0, 4).map((fire) => (
                  <li key={fire.id} className="flex items-center justify-between rounded border border-black/15 px-2 py-1">
                    <span className="font-mono text-xs">{fire.name}</span>
                    <span className="text-[11px] opacity-70">{fire.acres} acres</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="FLOOD WARNINGS">
            {floodWarnings === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : floodWarnings.length === 0 ? (
              <div className="text-xs opacity-60">No flood warnings</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {floodWarnings.slice(0, 4).map((flood) => (
                  <li key={flood.id} className="flex items-center justify-between rounded border border-black/15 px-2 py-1">
                    <span className="font-mono text-xs">{flood.location}</span>
                    <span className="text-[11px] opacity-70">{flood.severity}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="TIDE DATA">
            {tideData === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : tideData.length === 0 ? (
              <div className="text-xs opacity-60">No tide data available</div>
            ) : (
              <div className="space-y-1 text-xs">
                {tideData.slice(0, 4).map((tide, i) => (
                  <div key={i} className="flex items-center justify-between rounded border border-black/15 px-2 py-1">
                    <span className="font-mono text-[11px]">{tide.time}</span>
                    <span className="text-[10px] opacity-70">{tide.height}ft {tide.type}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="NWS ALERTS">
            {alerts === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : alerts.length === 0 ? (
              <div className="text-xs opacity-60">No active alerts</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {alerts.slice(0, 3).map((a) => (
                  <li key={a.id} className="rounded border border-black/20 p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold">{a.event}</span>
                      {a.severity && <span className="text-[11px] opacity-70">{a.severity}</span>}
                    </div>
                    {a.headline && <div className="text-xs">{a.headline}</div>}
                    <div className="mt-1 text-[11px]">
                      <a
                        className="underline"
                        href={`https://www.weather.gov/`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open NWS"
                      >
                        source: NWS
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </main>
    </div>
  );
}