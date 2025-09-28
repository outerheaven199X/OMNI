# 🌤️ OMNI - Weather & Air Quality Dashboard

![](https://i.imgur.com/LNZyTSi.png)

A comprehensive terminal-style React application that displays current weather, 5-day forecasts, air quality data, and environmental monitoring for any city worldwide. Built with TypeScript, React Query, and a monospace terminal aesthetic.

**🚧 Project Status: 30% Complete - Active Development**

## 🛠 Built With

- **React 19** + **TypeScript** + **Vite** - Modern frontend stack
- **TanStack React Query** - Efficient data fetching and caching
- **Tailwind CSS** - Utility-first styling with terminal theme
- **Zod** - Runtime type validation and schema parsing
- **MapLibre GL** - Interactive mapping and visualization
- **OpenWeatherMap API** - Weather data and forecasts
- **OpenAQ API** - Global air quality measurements
- **Multiple Free APIs** - NASA, USGS, NOAA, FAA, and more

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/outerheaven199X/OMNI.git
cd OMNI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenWeatherMap API key

# Start development server
npm run dev
```

## 🎮 Usage

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

Visit `http://localhost:5173` to see the application.

## ✨ Features

### 🌤️ Core Weather Features
- **Current Weather Display** - Temperature, humidity, wind speed, and conditions
- **5-Day Forecast** - Daily high/low temperatures with weather icons
- **Air Quality Index** - PM2.5, PM10, O3, NO2, SO2, and CO measurements
- **Interactive Map Visualization** - Real-time weather and storm tracking with MapLibre GL

### 🌍 Environmental Monitoring
- **Moon Phase Tracking** - Current lunar phase and illumination data
- **Earthquake Monitoring** - Recent seismic activity from USGS
- **Solar Activity** - Space weather data including Kp index and geomagnetic storms
- **UV Index** - Sun protection recommendations based on current conditions
- **Pollen Count** - Allergen levels for grass, tree, and weed pollen
- **Wildfire Tracking** - Active fire locations and containment status
- **Flood Warnings** - Water level monitoring and flood alerts
- **Tide Data** - Coastal tide predictions and marine weather

### 🚨 Emergency & Safety
- **Weather Alerts** - NWS severe weather warnings and advisories
- **Hurricane Tracking** - NHC current storm positions and forecasts
- **Flight Delays** - FAA weather-related airport delays and cancellations
- **Marine Weather** - Wave height, wind, and sea conditions

### 🎨 User Experience
- **Terminal UI** - Monospace font with green-on-black terminal styling
- **Real-time Data** - Powered by multiple free APIs (no keys required for most)
- **Responsive Design** - Works across desktop and mobile devices
- **Error Handling** - Graceful fallbacks when APIs are unavailable

## 🔧 Configuration

Create `.env.local` with your API keys:

```env
VITE_OWM_API_KEY=your_openweathermap_api_key_here
VITE_MAPTILER_KEY=your_maptiler_api_key_here
```

### Getting API Keys

1. **OpenWeatherMap**: Sign up at [openweathermap.org](https://openweathermap.org) for free weather data
2. **MapTiler**: Sign up at [maptiler.com](https://maptiler.com) for map visualization (optional - app works without it)
3. **Most APIs**: No keys required - NASA, USGS, NOAA, FAA, and OpenAQ are all free

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make changes following the coding guidelines
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit with descriptive messages
7. Push to your fork and submit a pull request

## 📜 License

This project is open source and available under the MIT License.

## 🗺 Roadmap

### 🚧 In Development (30% Complete)
- [x] Core weather display and 5-day forecast
- [x] Air quality monitoring with multiple pollutants
- [x] Interactive map with storm tracking
- [x] Environmental monitoring (moon, earthquakes, solar activity)
- [x] Emergency alerts and safety features
- [x] Terminal UI with responsive design

### 🔮 Planned Features (70% Remaining)
- [ ] **Advanced Analytics** - Historical weather trends and climate data
- [ ] **Custom Dashboards** - User-configurable widget layouts
- [ ] **Data Export** - CSV/JSON export for all environmental data
- [ ] **Notifications** - Push alerts for severe weather and emergencies
- [ ] **Multi-language Support** - Internationalization for global users
- [ ] **Offline Mode** - Cached data for areas with poor connectivity
- [ ] **API Rate Limiting** - Smart caching to respect API limits
- [ ] **Performance Optimization** - Lazy loading and code splitting
- [ ] **Accessibility** - Screen reader support and keyboard navigation
- [ ] **Mobile App** - React Native version for iOS/Android
- [ ] **Social Features** - Share weather conditions and alerts
- [ ] **Machine Learning** - Predictive weather modeling and anomaly detection
