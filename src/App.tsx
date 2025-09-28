import React, { useEffect, useMemo, useState } from "react";
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
import WireMap from "./components/WireMap";

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-black/20 bg-white p-3 shadow-sm">
      <h3 className="mb-2 font-mono text-sm font-bold tracking-wide">{title}</h3>
      {children}
    </section>
  );
}

function WireframeEarth({ size = 520 }: { size?: number }) {
  const longs = useMemo(() => Array.from({ length: 10 }, (_, i) => (i * 180) / 10 - 90), []);
  const lats  = useMemo(() => Array.from({ length: 6 },  (_, i) => (i * 180) / 7  - 90), []);
  return (
    <div className="relative mx-auto overflow-hidden rounded-full border border-black/80 bg-white"
         style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slower" style={{ transformOrigin: "50% 50%" }}>
        {/* PURE WIREFRAME: no fill/shading */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="black" strokeOpacity=".7" strokeWidth=".35" />
        <g fill="none" stroke="black" strokeOpacity=".7" strokeWidth=".25">
          {longs.map((deg) => (
            <ellipse key={`lon-${deg}`} cx="50" cy="50" rx="46" ry="46" transform={`rotate(${deg} 50 50)`} />
          ))}
          {lats.map((deg) => {
            const ry = 46 * Math.cos((deg * Math.PI) / 180);
            return <ellipse key={`lat-${deg}`} cx="50" cy="50" rx="46" ry={ry} />;
          })}
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("CITY");
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 27.7704, lon: -82.6695 });
  const [wx, setWx] = useState<DailyWeather | null>(null);
  const [aq, setAq] = useState<AirQualityNow | null>(null);
  const [alerts, setAlerts] = useState<NwsAlert[] | null>(null);
  const [storms, setStorms] = useState<NhcStorm[] | null>(null);
  const [news, setNews] = useState<GdeltArticle[] | null>(null);
  const [loading, setLoading] = useState<"idle" | "both" | "done">("idle");
  const [rightTab, setRightTab] = useState<"globe" | "map">("globe");
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
        const [w, a, al, st] = await Promise.all([
          fetchDailyWeather(coords.lat, coords.lon),
          fetchAirQualityNow(coords.lat, coords.lon),
          fetchNwsAlerts(coords.lat, coords.lon),
          fetchNhcCurrentStorms(),
        ]);
        if (!cancel) {
          setWx(w);
          setAq(a);
          setAlerts(al);
          setStorms(st);
        }
      } catch {
        if (!cancel) {
          setWx(null); setAq(null); setAlerts(null); setStorms(null);
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
      if (!city || city === "CITY") { setNews([]); return; }
      const short = city.split(",")[0]; // strip long "Place, Region"
      const items = await fetchGdeltNews(short);
      if (!cancel) setNews(items);
    })();
    return () => { cancel = true; };
  }, [city]);

  return (
    <div className="relative min-h-screen bg-white text-black">
      <div className="pointer-events-none fixed inset-0 -z-50 dot-matrix" />
      {/* HEADER */}
      <header className="mx-auto w-full max-w-[1420px] px-4 pt-4">
        <div className="mb-2 text-[11px] opacity-60">BUILD ID: {buildId}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-wide">OMNI</div>
            <div className="text-xs opacity-60">weather ops</div>
          </div>
          <form onSubmit={onSearch} className="flex items-center gap-2 rounded-full border border-black/25 bg-white/70 px-3 py-1 shadow-sm">
            <span className="opacity-70">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="zip or city…"
              className="w-[36vw] max-w-[420px] bg-transparent font-mono text-xs outline-none placeholder:text-black/40"
            />
            <button className="rounded-full border border-black/30 px-3 py-1 text-[11px] font-semibold hover:bg-black hover:text-white">
              ENTER
            </button>
          </form>
        </div>
      </header>

      {/* LAYOUT: left / center / right */}
      <main className="mx-auto grid w-full max-w-[1420px] grid-cols-1 gap-4 px-4 pb-10 pt-4 md:grid-cols-[280px_minmax(0,1fr)_600px]">
        {/* LEFT */}
        <div className="grid content-start gap-4">
          <Section title="HURRICANE (active storms)">
            {storms === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : storms.length === 0 ? (
              <div className="text-xs opacity-60">No active storms</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {storms.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded border border-black/15 px-2 py-1">
                    <span className="font-mono text-xs">{s.name}</span>
                    <span className="text-[11px] opacity-70">{s.status || s.basin}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="ZIP / CITY">
            <div className="text-xs opacity-70">Use the search bar in the header.</div>
          </Section>

          <Section title={`WEATHER NEWS (GDELT)${city && city !== "CITY" ? "" : " — GLOBAL"}`}>
            {news === null ? (
              <div className="text-xs opacity-60">loading…</div>
            ) : news.length === 0 ? (
              <div className="text-xs opacity-60">No recent local items</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {news.slice(0, 6).map((n) => (
                  <li key={n.url} className="leading-snug">
                    <a className="underline hover:no-underline" href={n.url} target="_blank" rel="noreferrer">
                      {n.title}
                    </a>
                    <div className="text-[11px] opacity-60">{n.domain} • {new Date(n.seendate).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="GLOBAL AVERAGE TEMP">
            <div className="text-3xl font-bold">+1.27°C</div>
            <div className="text-xs opacity-60">vs 1991–2020 baseline (static placeholder)</div>
          </Section>
        </div>

        {/* CENTER */}
        <div className="grid content-start gap-4">
          <Section title={`${city} — CURRENT / 5-DAY`}>
            {loading === "idle" && !wx ? (
              <div className="p-4 text-center text-xs opacity-60">enter a city or zip</div>
            ) : !wx ? (
              <div className="p-4 text-center text-xs opacity-60">loading…</div>
            ) : (
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                {wx.date.slice(0, 5).map((d, i) => (
                  <div key={d} className="rounded-lg border border-black/20 p-2">
                    <div className="font-semibold">{new Date(d).toLocaleDateString([], { weekday: "short" })}</div>
                    <div className="opacity-70">H {Math.round(wx.tmax[i])}°</div>
                    <div className="opacity-70">L {Math.round(wx.tmin[i])}°</div>
                    <div className="opacity-80">{codeToIcon(wx.code[i])}</div>
                    <div className="opacity-60">{wx.precip[i] ? `${Math.round(wx.precip[i])} mm` : "—"}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs opacity-60">lat {coords.lat.toFixed(4)} / lon {coords.lon.toFixed(4)}</div>
          </Section>

          <Section title="AIR QUALITY — NOW">
            {!aq ? (
              <div className="p-4 text-center text-xs opacity-60">loading…</div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {[
                  ["AQI", aq.aqi !== null ? String(Math.round(aq.aqi)) : "—"],
                  ["PM2.5", aq.pm25 !== null ? `${Math.round(aq.pm25)} µg/m³` : "—"],
                  ["PM10", aq.pm10 !== null ? `${Math.round(aq.pm10)} µg/m³` : "—"],
                  ["O₃", aq.o3 !== null ? `${Math.round(aq.o3)} µg/m³` : "—"],
                  ["NO₂", aq.no2 !== null ? `${Math.round(aq.no2)} µg/m³` : "—"],
                  ["SO₂", aq.so2 !== null ? `${Math.round(aq.so2)} µg/m³` : "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-lg border border-black/20 p-3 text-center">
                    <div className="font-semibold">{k}</div>
                    <div className="opacity-70">{v as string}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="LOCAL WEATHER / EMERGENCY ALERTS (NWS)">
            {alerts === null ? (
              <div className="p-4 text-center text-xs opacity-60">loading…</div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-xs opacity-60">No active alerts for this location</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {alerts.slice(0, 6).map((a) => (
                  <li key={a.id} className="rounded border border-black/20 p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold">{a.event}</span>
                      {a.severity && <span className="text-[11px] opacity-70">{a.severity}</span>}
                    </div>
                    {a.headline && <div className="text-xs">{a.headline}</div>}
                    {a.description && <div className="mt-1 text-[11px] opacity-70 line-clamp-3">{a.description}</div>}
                    {a.instruction && <div className="mt-1 text-[11px] opacity-90">{a.instruction}</div>}
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

        {/* RIGHT — globe / wiremap tabs */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-black/20 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-center gap-2">
              <button
                onClick={() => setRightTab("globe")}
                className={`rounded border px-2 py-1 text-xs ${rightTab === "globe" ? "bg-black text-white" : "bg-white"}`}
              >
                GLOBE
              </button>
              <button
                onClick={() => setRightTab("map")}
                className={`rounded border px-2 py-1 text-xs ${rightTab === "map" ? "bg-black text-white" : "bg-white"}`}
              >
                WIREMAP
              </button>
            </div>
            <div className="grid place-items-center">
              {rightTab === "globe" ? (
                <div className="max-w-[560px] min-w-[420px]">
                  <WireframeEarth size={520} />
                </div>
              ) : (
                <WireMap 
                  lat={coords.lat} 
                  lon={coords.lon} 
                  storms={storms?.filter(s => s.lat && s.lon).map(s => ({
                    lat: s.lat!,
                    lon: s.lon!,
                    name: s.name
                  })) || []} 
                />
              )}
            </div>
          </div>
          <div className="text-center text-xs opacity-70">lat {coords.lat.toFixed(4)} / lon {coords.lon.toFixed(4)}</div>
        </div>
      </main>
    </div>
  );
}