import type { DailyForecast } from '../lib/schemas';

interface ForecastStripProps {
  forecast: DailyForecast[] | null;
  isLoading: boolean;
  error: string | null;
}

export function ForecastStrip({ forecast, isLoading, error }: ForecastStripProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">5-Day Forecast</h3>
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Forecast Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">5-Day Forecast</h3>
        <p className="text-gray-600">Search for a city to see forecast data</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">5-Day Forecast</h3>
      <div className="flex gap-4 overflow-x-auto">
        {forecast.map((day, index) => (
          <div key={index} className="flex-shrink-0 w-24 text-center">
            <div className="text-sm text-gray-600 mb-2">{formatDate(day.date)}</div>
            <div className="mb-2">
              {day.icon && (
                <img 
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                  alt={day.description}
                  className="w-8 h-8 mx-auto"
                />
              )}
            </div>
            <div className="text-sm font-medium text-gray-800">
              {Math.round(day.maxC)}° / {Math.round(day.minC)}°
            </div>
            <div className="text-xs text-gray-600 capitalize mt-1">
              {day.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
