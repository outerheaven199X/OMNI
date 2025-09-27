import React, { useMemo, useState } from "react";

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
    <div className="relative mx-auto overflow-hidden rounded-full border border-black/30 bg-white"
         style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slower" style={{ transformOrigin: "50% 50%" }}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%">
            <stop offset="75%" stopColor="black" stopOpacity="0.035" />
            <stop offset="100%" stopColor="black" stopOpacity="0.11" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#glow)" stroke="black" strokeOpacity=".15" />
        <g fill="none" stroke="black" strokeOpacity=".35" strokeWidth=".25">
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
  const [city, setCity]   = useState("CITY");
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 27.7704, lon: -82.6695 });
  const [buildId] = useState(() => new Date().toISOString());

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    try {
      const key = (import.meta as any).env?.VITE_MAPTILER_KEY;
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${key}&limit=1`);
      const data = await res.json();
      const f = data?.features?.[0];
      if (f?.center) {
        setCity((f.place_name || q).toUpperCase());
        setCoords({ lat: f.center[1], lon: f.center[0] });
      } else {
        setCity(q.toUpperCase());
      }
    } catch {
      setCity(q.toUpperCase());
    }
  }

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
          <Section title="HURRICANE (svg logo)">
            <div className="h-28 w-full rounded-lg border border-black/20" />
          </Section>
          <Section title="ZIP CODE ENTRY">
            <div className="text-xs opacity-70">Use the search bar in the header.</div>
          </Section>
          <Section title="WEATHER NEWS">
            <ul className="space-y-2 text-sm">
              <li>• Placeholder headline A</li>
              <li>• Placeholder headline B</li>
              <li>• Placeholder headline C</li>
            </ul>
          </Section>
          <Section title="GLOBAL AVERAGE TEMP">
            <div className="text-3xl font-bold">+1.27°C</div>
            <div className="text-xs opacity-60">vs 1991–2020 baseline</div>
          </Section>
        </div>

        {/* CENTER */}
        <div className="grid content-start gap-4">
          <Section title={`${city} — CURRENT / 5-DAY`}>
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
              {["D1","D2","D3","D4","D5"].map(d => (
                <div key={d} className="rounded-lg border border-black/20 p-2">
                  <div className="font-semibold">{d}</div>
                  <div className="opacity-70">H 26°</div>
                  <div className="opacity-70">L 18°</div>
                  <div className="opacity-70">CLD</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs opacity-60">lat {coords.lat.toFixed(4)} / lon {coords.lon.toFixed(4)}</div>
          </Section>
          <Section title="LOCAL WEATHER / EMERGENCY NEWS">
            <ul className="space-y-2 text-sm">
              <li>• County advisory placeholder</li>
              <li>• FEMA PSA placeholder</li>
              <li>• Utility notice placeholder</li>
            </ul>
          </Section>
        </div>

        {/* RIGHT — clamped globe */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-black/20 bg-white p-4 shadow-sm">
            <div className="max-w-[560px] min-w-[420px]">
              <WireframeEarth size={520} />
            </div>
          </div>
          <div className="text-center text-xs opacity-70">lat {coords.lat.toFixed(4)} / lon {coords.lon.toFixed(4)}</div>
        </div>
      </main>
    </div>
  );
}