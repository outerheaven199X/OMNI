# 🌤️ Weather & Air Quality Dashboard

A terminal-style React application that displays current weather, 5-day forecasts, and air quality data for any city worldwide. Built with TypeScript, React Query, and a monospace terminal aesthetic.

## 🛠 Built With

- **React 19** + **TypeScript** + **Vite** - Modern frontend stack
- **TanStack React Query** - Efficient data fetching and caching
- **Tailwind CSS** - Utility-first styling with terminal theme
- **Zod** - Runtime type validation and schema parsing
- **OpenWeatherMap API** - Weather data and forecasts
- **OpenAQ API** - Global air quality measurements

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

- **Current Weather Display** - Temperature, humidity, wind speed, and conditions
- **5-Day Forecast** - Daily high/low temperatures with weather icons
- **Air Quality Index** - PM2.5, PM10, O3, NO2, SO2, and CO measurements
- **Interactive US Heatmap** - Visual representation of air quality across states
- **Terminal UI** - Monospace font with green-on-black terminal styling
- **Real-time Data** - Powered by OpenWeatherMap and OpenAQ APIs

## 🔧 Configuration

Create `.env.local` with your API keys:

```env
VITE_OWM_API_KEY=your_openweathermap_api_key_here
```

### Getting API Keys

1. **OpenWeatherMap**: Sign up at [openweathermap.org](https://openweathermap.org) for free weather data
2. **OpenAQ**: No API key required - free air quality data

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

- [ ] Add more detailed weather maps
- [ ] Implement weather alerts and notifications
- [ ] Add historical weather data visualization
- [ ] Support for multiple languages
- [ ] Mobile-responsive design improvements