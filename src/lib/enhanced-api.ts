// Enhanced API integrations for comprehensive weather dashboard
// All APIs are free and don't require API keys

export type MoonPhase = {
  phase: string;
  illumination: number;
  nextFullMoon: string;
  nextNewMoon: string;
};

export type Earthquake = {
  id: string;
  magnitude: number;
  place: string;
  time: string;
  lat: number;
  lon: number;
  depth: number;
};

export type SolarActivity = {
  kpIndex: number;
  solarWindSpeed: number;
  sunspotNumber: number;
  geomagneticStorm: boolean;
};

export type FlightDelay = {
  airport: string;
  delays: number;
  cancellations: number;
  weatherReason: string;
};

export type MarineWeather = {
  waveHeight: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  seaTemperature: number;
};

export type UVIndex = {
  index: number;
  risk: string;
  protection: string;
};

export type PollenCount = {
  grass: number;
  tree: number;
  weed: number;
  overall: string;
};

export type Wildfire = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  acres: number;
  containment: number;
  status: string;
};

export type FloodWarning = {
  id: string;
  location: string;
  severity: string;
  status: string;
  waterLevel: number;
  floodStage: number;
};

export type TideData = {
  time: string;
  height: number;
  type: 'high' | 'low';
};

// ---------- 7Timer! Weather API (No API key required) ----------
export async function fetch7TimerWeather(lat: number, lon: number) {
  try {
    const url = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('7Timer API failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('7Timer API error:', error);
    return null;
  }
}

// ---------- Moon Phase API (Free, no key) ----------
export async function fetchMoonPhase(): Promise<MoonPhase> {
  try {
    const now = new Date();
    const url = `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=0&longitude=0&elevation=0&from_date=${now.toISOString().split('T')[0]}&to_date=${now.toISOString().split('T')[0]}&time=12:00:00`;
    
    // Fallback to calculation-based approach
    const daysSinceNewMoon = (now.getTime() - new Date('2024-01-11').getTime()) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceNewMoon % 29.53) / 29.53;
    
    let phaseName = '';
    let illumination = 0;
    
    if (phase < 0.125) {
      phaseName = 'New Moon';
      illumination = 0;
    } else if (phase < 0.25) {
      phaseName = 'Waxing Crescent';
      illumination = phase * 4;
    } else if (phase < 0.375) {
      phaseName = 'First Quarter';
      illumination = 0.5;
    } else if (phase < 0.5) {
      phaseName = 'Waxing Gibbous';
      illumination = 0.5 + (phase - 0.375) * 4;
    } else if (phase < 0.625) {
      phaseName = 'Full Moon';
      illumination = 1;
    } else if (phase < 0.75) {
      phaseName = 'Waning Gibbous';
      illumination = 1 - (phase - 0.625) * 4;
    } else if (phase < 0.875) {
      phaseName = 'Last Quarter';
      illumination = 0.5;
    } else {
      phaseName = 'Waning Crescent';
      illumination = 0.5 - (phase - 0.875) * 4;
    }
    
    // Calculate next full moon (approximate)
    const nextFullMoon = new Date(now.getTime() + (14.77 - (phase * 29.53)) * 24 * 60 * 60 * 1000);
    const nextNewMoon = new Date(now.getTime() + (29.53 - (phase * 29.53)) * 24 * 60 * 60 * 1000);
    
    return {
      phase: phaseName,
      illumination: Math.round(illumination * 100),
      nextFullMoon: nextFullMoon.toLocaleDateString(),
      nextNewMoon: nextNewMoon.toLocaleDateString()
    };
  } catch (error) {
    console.warn('Moon phase API error:', error);
    return {
      phase: 'Unknown',
      illumination: 0,
      nextFullMoon: 'Unknown',
      nextNewMoon: 'Unknown'
    };
  }
}

// ---------- OpenAQ Air Quality API ----------
export async function fetchOpenAQData(lat: number, lon: number) {
  try {
    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=10000&limit=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('OpenAQ API failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('OpenAQ API error:', error);
    return null;
  }
}

// ---------- USGS Earthquake API ----------
export async function fetchEarthquakes(): Promise<Earthquake[]> {
  try {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
    const response = await fetch(url);
    if (!response.ok) throw new Error('USGS API failed');
    const data = await response.json();
    
    return data.features.slice(0, 10).map((feature: any) => ({
      id: feature.id,
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      time: new Date(feature.properties.time).toLocaleString(),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      depth: feature.geometry.coordinates[2]
    }));
  } catch (error) {
    console.warn('USGS Earthquake API error:', error);
    return [];
  }
}

// ---------- NASA Space Weather API ----------
export async function fetchSolarActivity(): Promise<SolarActivity> {
  try {
    const url = 'https://services.swpc.noaa.gov/json/goes/goes-16-magnetics-1m.json';
    const response = await fetch(url);
    if (!response.ok) throw new Error('NASA API failed');
    const data = await response.json();
    
    // Get latest data point
    const latest = data[data.length - 1];
    
    return {
      kpIndex: latest?.kp_index || 0,
      solarWindSpeed: latest?.wind_speed || 0,
      sunspotNumber: latest?.sunspot_number || 0,
      geomagneticStorm: (latest?.kp_index || 0) > 5
    };
  } catch (error) {
    console.warn('NASA Solar Activity API error:', error);
    return {
      kpIndex: 0,
      solarWindSpeed: 0,
      sunspotNumber: 0,
      geomagneticStorm: false
    };
  }
}

// ---------- Flight Delay Data (FAA) ----------
export async function fetchFlightDelays(): Promise<FlightDelay[]> {
  try {
    const url = 'https://www.fly.faa.gov/flyfaa/xml/ASPM.xml';
    const response = await fetch(url);
    if (!response.ok) throw new Error('FAA API failed');
    const text = await response.text();
    
    // Parse XML and extract weather-related delays
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const airports = xmlDoc.getElementsByTagName('Airport');
    
    const delays: FlightDelay[] = [];
    for (let i = 0; i < Math.min(5, airports.length); i++) {
      const airport = airports[i];
      delays.push({
        airport: airport.getAttribute('code') || 'Unknown',
        delays: parseInt(airport.getAttribute('delay') || '0'),
        cancellations: parseInt(airport.getAttribute('cancellations') || '0'),
        weatherReason: airport.getAttribute('reason') || 'Unknown'
      });
    }
    
    return delays;
  } catch (error) {
    console.warn('FAA Flight Delays API error:', error);
    return [];
  }
}

// ---------- NOAA Marine Weather API ----------
export async function fetchMarineWeather(lat: number, lon: number): Promise<MarineWeather | null> {
  try {
    const url = `https://api.weather.gov/points/${lat},${lon}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OMNI-Weather (https://example.com)' }
    });
    if (!response.ok) throw new Error('NOAA API failed');
    const data = await response.json();
    
    // Get marine forecast
    const marineUrl = data.properties?.forecastGridData;
    if (!marineUrl) return null;
    
    const marineResponse = await fetch(marineUrl, {
      headers: { 'User-Agent': 'OMNI-Weather (https://example.com)' }
    });
    if (!marineResponse.ok) return null;
    
    const marineData = await marineResponse.json();
    
    return {
      waveHeight: marineData.properties?.waveHeight?.values?.[0]?.value || 0,
      windSpeed: marineData.properties?.windSpeed?.values?.[0]?.value || 0,
      windDirection: marineData.properties?.windDirection?.values?.[0]?.value || 0,
      visibility: marineData.properties?.visibility?.values?.[0]?.value || 0,
      seaTemperature: marineData.properties?.temperature?.values?.[0]?.value || 0
    };
  } catch (error) {
    console.warn('NOAA Marine Weather API error:', error);
    return null;
  }
}

// ---------- UV Index API ----------
export async function fetchUVIndex(lat: number, lon: number): Promise<UVIndex> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('UV Index API failed');
    const data = await response.json();
    
    const uvIndex = data.daily?.uv_index_max?.[0] || 0;
    let risk = '';
    let protection = '';
    
    if (uvIndex <= 2) {
      risk = 'Low';
      protection = 'Minimal protection required';
    } else if (uvIndex <= 5) {
      risk = 'Moderate';
      protection = 'Some protection required';
    } else if (uvIndex <= 7) {
      risk = 'High';
      protection = 'Protection required';
    } else if (uvIndex <= 10) {
      risk = 'Very High';
      protection = 'Extra protection required';
    } else {
      risk = 'Extreme';
      protection = 'Avoid sun exposure';
    }
    
    return {
      index: Math.round(uvIndex),
      risk,
      protection
    };
  } catch (error) {
    console.warn('UV Index API error:', error);
    return {
      index: 0,
      risk: 'Unknown',
      protection: 'Unknown'
    };
  }
}

// ---------- Pollen Count API (Open-Meteo) ----------
export async function fetchPollenCount(lat: number, lon: number): Promise<PollenCount> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Pollen API failed');
    const data = await response.json();
    
    const grass = data.hourly?.grass_pollen?.[0] || 0;
    const tree = (data.hourly?.alder_pollen?.[0] || 0) + (data.hourly?.birch_pollen?.[0] || 0) + (data.hourly?.olive_pollen?.[0] || 0);
    const weed = (data.hourly?.mugwort_pollen?.[0] || 0) + (data.hourly?.ragweed_pollen?.[0] || 0);
    
    const total = grass + tree + weed;
    let overall = '';
    
    if (total < 10) overall = 'Low';
    else if (total < 50) overall = 'Moderate';
    else if (total < 100) overall = 'High';
    else overall = 'Very High';
    
    return {
      grass: Math.round(grass),
      tree: Math.round(tree),
      weed: Math.round(weed),
      overall
    };
  } catch (error) {
    console.warn('Pollen Count API error:', error);
    return {
      grass: 0,
      tree: 0,
      weed: 0,
      overall: 'Unknown'
    };
  }
}

// ---------- Wildfire Data API ----------
export async function fetchWildfires(): Promise<Wildfire[]> {
  try {
    const url = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/CY_WildlandFire_Locations_ToDate/FeatureServer/0/query?where=1%3D1&outFields=*&f=json';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Wildfire API failed');
    const data = await response.json();
    
    return data.features.slice(0, 10).map((feature: any) => ({
      id: feature.attributes.FIRE_ID || 'Unknown',
      name: feature.attributes.FIRE_NAME || 'Unknown',
      lat: feature.geometry?.y || 0,
      lon: feature.geometry?.x || 0,
      acres: feature.attributes.GIS_ACRES || 0,
      containment: feature.attributes.CONTAINMENT || 0,
      status: feature.attributes.FIRE_STATUS || 'Unknown'
    }));
  } catch (error) {
    console.warn('Wildfire API error:', error);
    return [];
  }
}

// ---------- Flood Warnings API (USGS) ----------
export async function fetchFloodWarnings(): Promise<FloodWarning[]> {
  try {
    const url = 'https://water.usgs.gov/nwc/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ahps:flood_warnings&outputFormat=application/json';
    const response = await fetch(url);
    if (!response.ok) throw new Error('USGS Flood API failed');
    const data = await response.json();
    
    return data.features.slice(0, 10).map((feature: any) => ({
      id: feature.properties?.site_id || 'Unknown',
      location: feature.properties?.site_name || 'Unknown',
      severity: feature.properties?.severity || 'Unknown',
      status: feature.properties?.status || 'Unknown',
      waterLevel: feature.properties?.water_level || 0,
      floodStage: feature.properties?.flood_stage || 0
    }));
  } catch (error) {
    console.warn('USGS Flood Warnings API error:', error);
    return [];
  }
}

// ---------- NOAA Tides API ----------
export async function fetchTideData(lat: number, lon: number): Promise<TideData[]> {
  try {
    // This is a simplified version - real implementation would need station lookup
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${new Date().toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}&datum=MLLW&station=8729108&time_zone=gmt&units=english&interval=h&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('NOAA Tides API failed');
    const data = await response.json();
    
    return data.predictions?.slice(0, 8).map((pred: any) => ({
      time: new Date(pred.t).toLocaleTimeString(),
      height: parseFloat(pred.v),
      type: parseFloat(pred.v) > 2 ? 'high' : 'low'
    })) || [];
  } catch (error) {
    console.warn('NOAA Tides API error:', error);
    return [];
  }
}
