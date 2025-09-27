import { fetchJSON } from "../lib/http";
import { _raw, AqiReadingSchema, type AqiReading } from "../lib/schemas";

export async function fetchAqiByCoords(lat: number, lon: number, radiusM = 3000): Promise<AqiReading> {
  const base = "https://api.openaq.org/v2/latest";
  const params = new URLSearchParams({
    coordinates: `${lat},${lon}`,
    radius: String(radiusM),
    parameter: ["pm25","pm10","o3","no2","so2","co"].join(","),
    limit: "50",
    order_by: "distance",
    sort: "asc",
  });
  const url = `${base}?${params.toString()}`;
  const data = await fetchJSON<unknown>(url);
  const parsed = _raw.OpenAqLatestSchema.parse(data);

  const nearest = parsed.results[0];
  const pick = (p: string) => nearest?.measurements.find((m) => m.parameter.toLowerCase() === p)?.value ?? null;

  const pm25 = pick("pm25");
  const pm10 = pick("pm10");
  const o3 = pick("o3");
  const no2 = pick("no2");
  const so2 = pick("so2");
  const co = pick("co");

  const level = deriveLevelFromPm25(pm25);
  return AqiReadingSchema.parse({ pm25, pm10, o3, no2, so2, co, level });
}

function deriveLevelFromPm25(pm25: number | null) {
  if (pm25 == null) return "unknown";
  if (pm25 <= 12) return "good";
  if (pm25 <= 35.4) return "moderate";
  if (pm25 <= 55.4) return "unhealthy_sensitive";
  if (pm25 <= 150.4) return "unhealthy";
  if (pm25 <= 250.4) return "very_unhealthy";
  return "hazardous";
}
