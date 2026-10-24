# 🌤 SkyCast — Advanced MERN Weather App

A premium full-stack weather application built with the **MERN stack** (MongoDB, Express, React, Node.js).

## 🗂 Project Structure

```
Advance Weather App/
├── server/                 # Node.js + Express backend
│   ├── models/
│   │   ├── SearchHistory.js
│   │   └── FavoriteCity.js
│   ├── routes/
│   │   ├── weather.js      # OpenWeatherMap API proxy + mock fallback
│   │   └── search.js       # History & Favorites CRUD
│   ├── server.js
│   └── .env                ← Add your API key here
│
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Header        # Search, autocomplete, history, favorites
│       │   ├── HeroCard      # Main weather display + animations
│       │   ├── StatsGrid     # Humidity, wind, UV, pressure, visibility
│       │   ├── AQICard       # Air quality index
│       │   ├── HourlyForecast  # 27-hour scroll + Recharts area chart
│       │   └── WeeklyForecast  # 7-day outlook
│       ├── hooks/useWeather.js  # All data fetching via React Query
│       ├── services/api.js      # Axios API layer
│       └── utils/helpers.js     # Formatters, themes, utilities
│
└── package.json            # Root with concurrently script
```

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Add your API key (optional - works with demo data)
# Edit server/.env → OPENWEATHER_API_KEY=your_key_here

# 3. Run both servers
npm run dev
```

- **React app** → http://localhost:5173  
- **Express API** → http://localhost:5000

## 🔑 Getting an API Key

1. Sign up free at [openweathermap.org](https://openweathermap.org/api)
2. Go to your API keys and copy the key
3. Paste it into `server/.env` as `OPENWEATHER_API_KEY`

## 🌟 Features

| Feature | Details |
|---|---|
| 🔍 Live Search | Autocomplete with 5 city suggestions |
| 📍 Geolocation | One-click "use my location" |
| 🌡 Unit Toggle | Switch between °C and °F |
| ⏱ Hourly Forecast | Next 27 hours with area chart |
| 📅 7-Day Forecast | Daily high/low breakdown |
| 🌿 AQI | Air quality + 6 pollutant breakdown |
| 📈 **NOAA 30-Day History** | Real daily TMAX/TMIN/PRCP from GHCND stations |
| 📅 **NOAA Monthly Summary** | Monthly temperature range + precipitation charts |
| 🏆 **NOAA Records** | All-time high, low, and rainfall records |
| ⭐ Favorites | Save cities to MongoDB |
| 🕓 Search History | Recent searches stored in MongoDB |
| 🗺 Map | OpenStreetMap embed for location |
| 📱 Responsive | Optimized for mobile + desktop |
| 🎨 Demo Mode | Works without API keys using rich mock data |

## 🌐 APIs Used

| API | Purpose | Token |
|---|---|---|
| [OpenWeatherMap](https://openweathermap.org/api) | Current weather, forecast, AQI | `OPENWEATHER_API_KEY` in `server/.env` |
| [NOAA CDO v2](https://www.ncei.noaa.gov/cdo-web/api/v2/) | Historical climate data, records, normals | `NOAA_CDO_TOKEN` in `server/.env` |

### NOAA CDO Endpoints Used

```
GET /api/noaa/datasets              → List available CDO datasets
GET /api/noaa/station?lat=&lon=     → Find nearest GHCND weather station
GET /api/noaa/history/daily         → Last 30 days: TMAX, TMIN, PRCP, AWND, SNOW
GET /api/noaa/history/monthly       → Monthly summaries (GSOM dataset)
GET /api/noaa/records               → All-time temperature & rain records
GET /api/noaa/normals               → 30-year climate normals
GET /api/noaa/proxy/:endpoint       → Generic CDO passthrough proxy
```

Get a free NOAA token at: https://www.ncdc.noaa.gov/cdo-web/token


## 🛠 Tech Stack

- **MongoDB** + Mongoose — Search history & favorite cities
- **Express.js** — REST API, rate limiting, 10-min caching
- **React** + Vite — UI with Framer Motion animations
- **Node.js** — Backend runtime
- **React Query** — Smart data fetching & caching
- **Recharts** — Temperature area chart
- **Framer Motion** — Smooth animations
