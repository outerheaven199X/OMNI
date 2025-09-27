import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '../components/SearchBar';
import { WeatherCard } from '../components/WeatherCard';
import { AqiCard } from '../components/AqiCard';
import { ForecastStrip } from '../components/ForecastStrip';
import { fetchCurrentWeather, fetchForecast, fetchCoordsForCity } from '../api/weather';
import { fetchAqiByCoords } from '../api/air';

export function Dashboard() {
  const [searchCity, setSearchCity] = useState('');

  // Weather queries
  const { 
    data: weather, 
    isLoading: weatherLoading, 
    error: weatherError 
  } = useQuery({
    queryKey: ['weather', searchCity],
    queryFn: () => fetchCurrentWeather(searchCity),
    enabled: !!searchCity,
  });

  const { 
    data: forecast, 
    isLoading: forecastLoading, 
    error: forecastError 
  } = useQuery({
    queryKey: ['forecast', searchCity],
    queryFn: () => fetchForecast(searchCity),
    enabled: !!searchCity,
  });

  // Air quality query (depends on weather data for coordinates)
  const { 
    data: aqi, 
    isLoading: aqiLoading, 
    error: aqiError 
  } = useQuery({
    queryKey: ['aqi', weather?.lat, weather?.lon],
    queryFn: () => fetchAqiByCoords(weather!.lat, weather!.lon),
    enabled: !!(weather?.lat && weather?.lon),
  });

  const handleSearch = (city: string) => {
    setSearchCity(city);
  };

  const isLoading = weatherLoading || forecastLoading || aqiLoading;
  const hasError = weatherError || forecastError || aqiError;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Weather & Air Quality Dashboard</h1>
          <p className="text-gray-600">Get current weather, forecast, and air quality data for any city</p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {hasError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">
              {weatherError?.message || forecastError?.message || aqiError?.message}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WeatherCard 
            weather={weather || null} 
            isLoading={weatherLoading} 
            error={weatherError?.message || null} 
          />
          <AqiCard 
            aqi={aqi || null} 
            isLoading={aqiLoading} 
            error={aqiError?.message || null} 
          />
        </div>

        <ForecastStrip 
          forecast={forecast || null} 
          isLoading={forecastLoading} 
          error={forecastError?.message || null} 
        />
      </div>
    </div>
  );
}
