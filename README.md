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

## 🌟 Features

| Feature | Details |
|---|---|
| 🔍 Live Search | Autocomplete with 5 city suggestions |
| 📍 Geolocation | One-click "use my location" |
| 🌡 Unit Toggle | Switch between °C and °F |
| ⏱ Hourly Forecast | Next 27 hours with area chart |
| 📅 7-Day Forecast | Daily high/low breakdown |
| 🌿 AQI | Air quality + 6 pollutant breakdown |
| ⭐ Favorites | Save cities to MongoDB |
| 🕓 Search History | Recent searches stored in MongoDB |
| 🗺 Map | OpenStreetMap embed for location |
| 📱 Responsive | Optimized for mobile + desktop |

## 🌐 APIs Used

| API | Purpose | Token |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | Real-time weather, hourly/7-day forecast, AQI & geocoding (Single API) | None (100% Free & Live) |


## 🛠 Tech Stack

- **MongoDB** + Mongoose — Search history & favorite cities
- **Express.js** — REST API, rate limiting, 10-min caching
- **React** + Vite — UI with Framer Motion animations
- **Node.js** — Backend runtime
- **React Query** — Smart data fetching & caching
- **Recharts** — Temperature area chart
- **Framer Motion** — Smooth animations
