export type DailyWeather = {
  date: string[];
  tmax: number[];
  tmin: number[];
  code: number[];
  precip: number[];
};

export type AirQualityNow = {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  so2: number | null;
};

export type GdeltArticle = {
  title: string;
  url: string;
  domain: string;
  lang: string;
  seendate: string;
};

export type NwsAlert = {
  id: string;
  event: string;
  headline?: string;
  severity?: string;
  onset?: string;
  ends?: string;
  description?: string;
  instruction?: string;
};

export type NhcStorm = {
  id: string;
  name: string;
  basin: string;
  advisory?: string;
  lat?: number;
  lon?: number;
  status?: string;
};

const USER_AGENT =
  "OMNI-Weather (https://example.com; contact: user@example.com)"; // NWS likes a UA header

// ---------- Open-Meteo ----------
export async function fetchDailyWeather(lat: number, lon: number): Promise<DailyWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode");

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error("weather fetch failed");
  const j = await r.json();

  return {
    date: j.daily.time,
    tmax: j.daily.temperature_2m_max,
    tmin: j.daily.temperature_2m_min,
    code: j.daily.weathercode,
    precip: j.daily.precipitation_sum,
  };
}

export async function fetchAirQualityNow(lat: number, lon: number): Promise<AirQualityNow> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("hourly", "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide");
  url.searchParams.set("timezone", "auto");

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error("aq fetch failed");
  const j = await r.json();

  const last = (arr: number[] | undefined) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null);

  return {
    aqi: last(j.hourly?.us_aqi),
    pm25: last(j.hourly?.pm2_5),
    pm10: last(j.hourly?.pm10),
    o3: last(j.hourly?.ozone),
    no2: last(j.hourly?.nitrogen_dioxide),
    so2: last(j.hourly?.sulphur_dioxide),
  };
}

// ---------- Weathercode → shorthand ----------
export function codeToIcon(code: number): string {
  if ([0].includes(code)) return "CLR";
  if ([1, 2, 3].includes(code)) return "CLD";
  if ([45, 48].includes(code)) return "FG";
  if ([51, 53, 55, 56, 57].includes(code)) return "DRZ";
  if ([61, 63, 65, 66, 67].includes(code)) return "RN";
  if ([71, 73, 75, 77].includes(code)) return "SN";
  if ([80, 81, 82].includes(code)) return "SHW";
  if ([95, 96, 99].includes(code)) return "TS";
  return "—";
}

// ---------- GDELT 2.1 Docs API (news by city keyword) ----------
export async function fetchGdeltNews(city: string): Promise<GdeltArticle[]> {
  const baseQuery = city
    ? `("${city}") AND (weather OR hurricane OR storm OR flood OR tornado OR wildfire OR evacuation OR advisory)`
    : `(weather OR hurricane OR storm OR flood OR tornado OR wildfire OR evacuation OR advisory)`;
  const q = encodeURIComponent(baseQuery);
  const url = `/api/gdelt?query=${q}&mode=ArtList&format=json&maxrecords=12&sort=datedesc`;
  const r = await fetch(url); // proxied → no CORS issues
  if (!r.ok) return [];
  const j = await r.json();
  const arts = Array.isArray(j?.articles) ? j.articles : [];
  return arts.map((a: { title: string; url: string; domain: string; language: string; seendate: string }) => ({
    title: a.title,
    url: a.url,
    domain: a.domain,
    lang: a.language,
    seendate: a.seendate,
  }));
}

// ---------- NWS Alerts for a point ----------
export async function fetchNwsAlerts(lat: number, lon: number): Promise<NwsAlert[]> {
  const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
  const r = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" } });
  if (!r.ok) return [];
  const j = await r.json();
  const feats = Array.isArray(j?.features) ? j.features : [];
  return feats.map((f: { id?: string; properties?: { id?: string; event?: string; headline?: string; severity?: string; onset?: string; ends?: string; description?: string; instruction?: string } }) => {
    const p = f?.properties || {};
    return {
      id: f?.id || p?.id || cryptoRandom(),
      event: p.event,
      headline: p.headline,
      severity: p.severity,
      onset: p.onset,
      ends: p.ends,
      description: p.description,
      instruction: p.instruction,
    };
  });
}

// ---------- NHC current storms (best-effort) ----------
export async function fetchNhcCurrentStorms(): Promise<NhcStorm[]> {
  // proxied to avoid CORS blockers
  const url = "/api/nhc";
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const j = await r.json();
    const list = Array.isArray(j) ? j : Array.isArray(j?.storms) ? j.storms : [];
    return list.map((s: { id?: string; name?: string; stormName?: string; basin?: string; basinId?: string; advisory?: string; advisoryNumber?: string; lat?: number | string; lon?: number | string; status?: string; stormType?: string }, i: number) => ({
      id: s?.id || String(i),
      name: s?.name || s?.stormName || "Storm",
      basin: s?.basin || s?.basinId || "ATL/EPAC",
      advisory: s?.advisory || s?.advisoryNumber,
      lat: typeof s?.lat === "number" ? s.lat : parseFloat(s?.lat || "0"),
      lon: typeof s?.lon === "number" ? s.lon : parseFloat(s?.lon || "0"),
      status: s?.status || s?.stormType,
    }));
  } catch {
    return [];
  }
}

function cryptoRandom() {
  // fallback id; not secure, just unique-ish
  return Math.random().toString(36).slice(2);
}
