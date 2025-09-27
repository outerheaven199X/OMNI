import { z } from "zod";

const OwmWeatherSchema = z.object({
  coord: z.object({ lon: z.number(), lat: z.number() }),
  weather: z.array(z.object({ description: z.string(), icon: z.string() })).nonempty(),
  main: z.object({ temp: z.number(), feels_like: z.number(), humidity: z.number() }),
  wind: z.object({ speed: z.number() }).optional(),
  name: z.string(),
});

const OwmForecastSchema = z.object({
  city: z.object({ name: z.string(), coord: z.object({ lon: z.number(), lat: z.number() }) }),
  list: z.array(
    z.object({
      dt: z.number(),
      main: z.object({ temp_min: z.number(), temp_max: z.number() }),
      weather: z.array(z.object({ description: z.string(), icon: z.string() })).nonempty(),
    })
  ),
});

const OpenAqLatestSchema = z.object({
  results: z.array(
    z.object({
      coordinates: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
      measurements: z.array(
        z.object({
          parameter: z.string(),
          value: z.number(),
          unit: z.string(),
        })
      ),
    })
  ),
});

export const CurrentWeatherSchema = z.object({
  city: z.string(),
  lat: z.number(),
  lon: z.number(),
  tempC: z.number(),
  feelsLikeC: z.number(),
  humidity: z.number(),
  windSpeedMs: z.number().nullable(),
  description: z.string(),
  icon: z.string(),
});
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;

export const DailyForecastSchema = z.object({
  date: z.string(),
  minC: z.number(),
  maxC: z.number(),
  icon: z.string(),
  description: z.string(),
});
export type DailyForecast = z.infer<typeof DailyForecastSchema>;

export const AqiReadingSchema = z.object({
  pm25: z.number().nullable(),
  pm10: z.number().nullable(),
  o3: z.number().nullable(),
  no2: z.number().nullable(),
  so2: z.number().nullable(),
  co: z.number().nullable(),
  level: z.enum(["good","moderate","unhealthy_sensitive","unhealthy","very_unhealthy","hazardous","unknown"]),
});
export type AqiReading = z.infer<typeof AqiReadingSchema>;

export const _raw = { OwmWeatherSchema, OwmForecastSchema, OpenAqLatestSchema };
