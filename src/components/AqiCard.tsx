import type { AqiReading } from '../lib/schemas';

interface AqiCardProps {
  aqi: AqiReading | null;
  isLoading: boolean;
  error: string | null;
}

const aqiLevels = {
  good: { label: 'Good', color: 'bg-green-500', textColor: 'text-green-800' },
  moderate: { label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-800' },
  unhealthy_sensitive: { label: 'Unhealthy for Sensitive', color: 'bg-orange-500', textColor: 'text-orange-800' },
  unhealthy: { label: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-800' },
  very_unhealthy: { label: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-800' },
  hazardous: { label: 'Hazardous', color: 'bg-red-800', textColor: 'text-red-100' },
  unknown: { label: 'Unknown', color: 'bg-gray-500', textColor: 'text-gray-800' },
};

export function AqiCard({ aqi, isLoading, error }: AqiCardProps) {
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
        <h3 className="text-lg font-semibold text-red-800 mb-2">Air Quality Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!aqi) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Air Quality</h3>
        <p className="text-gray-600">Search for a city to see air quality data</p>
      </div>
    );
  }

  const level = aqiLevels[aqi.level];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Air Quality</h3>
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
        <span className={`font-medium ${level.textColor}`}>{level.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {aqi.pm25 !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">PM2.5:</span>
            <span className="font-medium">{aqi.pm25} µg/m³</span>
          </div>
        )}
        {aqi.pm10 !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">PM10:</span>
            <span className="font-medium">{aqi.pm10} µg/m³</span>
          </div>
        )}
        {aqi.o3 !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">O₃:</span>
            <span className="font-medium">{aqi.o3} µg/m³</span>
          </div>
        )}
        {aqi.no2 !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">NO₂:</span>
            <span className="font-medium">{aqi.no2} µg/m³</span>
          </div>
        )}
        {aqi.so2 !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">SO₂:</span>
            <span className="font-medium">{aqi.so2} µg/m³</span>
          </div>
        )}
        {aqi.co !== null && (
          <div className="flex justify-between">
            <span className="text-gray-600">CO:</span>
            <span className="font-medium">{aqi.co} µg/m³</span>
          </div>
        )}
      </div>
    </div>
  );
}
