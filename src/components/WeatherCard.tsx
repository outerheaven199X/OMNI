import type { CurrentWeather } from '../lib/schemas';

interface WeatherCardProps {
  weather: CurrentWeather | null;
  isLoading: boolean;
  error: string | null;
}

export function WeatherCard({ weather, isLoading, error }: WeatherCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Weather Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Weather</h3>
        <p className="text-gray-600">Search for a city to see weather data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{weather.city}</h3>
        <div className="text-4xl">
          {weather.icon && (
            <img 
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
              alt={weather.description}
              className="w-12 h-12"
            />
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-3xl font-bold text-gray-900">{Math.round(weather.tempC)}°C</span>
          <span className="text-gray-600">Feels like {Math.round(weather.feelsLikeC)}°C</span>
        </div>
        
        <p className="text-lg text-gray-700 capitalize">{weather.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <span className="text-gray-500">Humidity:</span>
            <span className="ml-2 font-medium">{weather.humidity}%</span>
          </div>
          {weather.windSpeedMs && (
            <div>
              <span className="text-gray-500">Wind:</span>
              <span className="ml-2 font-medium">{Math.round(weather.windSpeedMs * 3.6)} km/h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
