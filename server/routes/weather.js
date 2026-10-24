const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 }); // 10-minute cache

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';
const GEO_URL = `${BASE_URL}/geo/1.0`;
const DATA_URL = `${BASE_URL}/data/2.5`;
const DATA3_URL = `${BASE_URL}/data/3.0`;

// ─── Mock data for demo when no API key ──────────────────────────────────────
const MOCK_DATA = {
  current: {
    city: 'New York',
    country: 'US',
    lat: 40.7128,
    lon: -74.006,
    temp: 22,
    feels_like: 20,
    temp_min: 18,
    temp_max: 26,
    humidity: 65,
    pressure: 1013,
    visibility: 10000,
    wind_speed: 5.5,
    wind_deg: 220,
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    sunrise: 1729742400,
    sunset: 1729783200,
    dt: Math.floor(Date.now() / 1000),
    timezone: -18000,
  },
  forecast: {
    list: Array.from({ length: 40 }, (_, i) => ({
      dt: Math.floor(Date.now() / 1000) + i * 3 * 3600,
      main: {
        temp: 18 + Math.sin(i / 4) * 8,
        feels_like: 17 + Math.sin(i / 4) * 7,
        humidity: 60 + Math.round(Math.random() * 20),
        pressure: 1010 + Math.round(Math.random() * 10),
      },
      weather: [
        {
          id: i % 5 === 0 ? 500 : 800,
          main: i % 5 === 0 ? 'Rain' : 'Clear',
          description: i % 5 === 0 ? 'light rain' : 'clear sky',
          icon: i % 5 === 0 ? '10d' : '01d',
        },
      ],
      wind: { speed: 3 + Math.random() * 5, deg: 180 + Math.round(Math.random() * 90) },
      visibility: 9000 + Math.round(Math.random() * 1000),
      pop: i % 5 === 0 ? 0.6 : 0.05,
    })),
  },
  aqi: {
    list: [
      {
        main: { aqi: 2 },
        components: {
          co: 233.65,
          no: 0.0,
          no2: 0.97,
          o3: 68.26,
          so2: 0.64,
          pm2_5: 3.38,
          pm10: 4.53,
          nh3: 0.34,
        },
      },
    ],
  },
  uv: { value: 5.2 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hapiKey = () => API_KEY && API_KEY !== 'your_openweathermap_api_key_here';

async function fetchGeocode(city) {
  const cacheKey = `geo_${city.toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const res = await axios.get(`${GEO_URL}/direct`, {
    params: { q: city, limit: 5, appid: API_KEY },
  });
  cache.set(cacheKey, res.data);
  return res.data;
}

async function fetchCurrent(lat, lon) {
  const cacheKey = `cur_${lat}_${lon}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const res = await axios.get(`${DATA_URL}/weather`, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  });
  cache.set(cacheKey, res.data);
  return res.data;
}

async function fetchForecast(lat, lon) {
  const cacheKey = `fore_${lat}_${lon}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const res = await axios.get(`${DATA_URL}/forecast`, {
    params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 },
  });
  cache.set(cacheKey, res.data);
  return res.data;
}

async function fetchAQI(lat, lon) {
  const cacheKey = `aqi_${lat}_${lon}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const res = await axios.get(`${DATA_URL}/air_pollution`, {
    params: { lat, lon, appid: API_KEY },
  });
  cache.set(cacheKey, res.data);
  return res.data;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/weather/current?city=London  OR  ?lat=51.5&lon=-0.12
router.get('/current', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!hapiKey()) {
      // Find matching mock city or default
      const mockCities = [
        { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006, temp: 22, feels_like: 20, temp_min: 18, temp_max: 26, weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }] },
        { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, temp: 16, feels_like: 15, temp_min: 12, temp_max: 18, weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }] },
        { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, temp: 24, feels_like: 23, temp_min: 20, temp_max: 27, weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }] },
        { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, temp: 19, feels_like: 18, temp_min: 14, temp_max: 21, weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }] },
        { name: 'Mumbai', country: 'IN', lat: 19.076, lon: 72.8777, temp: 31, feels_like: 35, temp_min: 27, temp_max: 33, weather: [{ id: 721, main: 'Haze', description: 'haze', icon: '50d' }] },
        { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, temp: 21, feels_like: 20, temp_min: 17, temp_max: 23, weather: [{ id: 800, main: 'Clear', description: 'sunny', icon: '01d' }] },
      ];
      const match = city ? mockCities.find(c => c.name.toLowerCase() === city.toLowerCase()) : null;
      const cityName = match ? match.name : (city ? (city.charAt(0).toUpperCase() + city.slice(1)) : 'New York');
      const countryCode = match ? match.country : 'US';
      const latitude = lat ? parseFloat(lat) : (match ? match.lat : 40.7128);
      const longitude = lon ? parseFloat(lon) : (match ? match.lon : -74.006);
      const temp = match ? match.temp : 22;
      const feels_like = match ? match.feels_like : 20;
      const temp_min = match ? match.temp_min : 18;
      const temp_max = match ? match.temp_max : 26;
      const weather = match ? match.weather : MOCK_DATA.current.weather;

      return res.json({
        ...MOCK_DATA.current,
        city: cityName,
        country: countryCode,
        lat: latitude,
        lon: longitude,
        temp,
        feels_like,
        temp_min,
        temp_max,
        weather,
        mock: true,
      });
    }

    let latitude = lat;
    let longitude = lon;
    let cityName = city;
    let countryCode = '';

    if (city) {
      const geo = await fetchGeocode(city);
      if (!geo.length) return res.status(404).json({ error: 'City not found' });
      latitude = geo[0].lat;
      longitude = geo[0].lon;
      cityName = geo[0].name;
      countryCode = geo[0].country;
    }

    const data = await fetchCurrent(latitude, longitude);
    res.json({
      city: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      temp_min: data.main.temp_min,
      temp_max: data.main.temp_max,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      weather: data.weather,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      dt: data.dt,
      timezone: data.timezone,
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Using mock data.', mock: true, ...MOCK_DATA.current });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/forecast?lat=&lon=
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!hapiKey()) return res.json({ ...MOCK_DATA.forecast, mock: true });

    const data = await fetchForecast(lat, lon);
    res.json(data);
  } catch (err) {
    console.error('Forecast API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/aqi?lat=&lon=
router.get('/aqi', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!hapiKey()) return res.json({ ...MOCK_DATA.aqi, mock: true });

    const data = await fetchAQI(lat, lon);
    res.json(data);
  } catch (err) {
    console.error('AQI API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/autocomplete?q=Lon
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    if (!hapiKey()) {
      const mockCities = [
        { name: 'New York', country: 'US', state: 'New York', lat: 40.71, lon: -74.0 },
        { name: 'London', country: 'GB', state: 'England', lat: 51.51, lon: -0.12 },
        { name: 'Tokyo', country: 'JP', state: 'Tokyo', lat: 35.69, lon: 139.69 },
        { name: 'Mumbai', country: 'IN', state: 'Maharashtra', lat: 19.07, lon: 72.87 },
        { name: 'Paris', country: 'FR', state: 'Île-de-France', lat: 48.85, lon: 2.35 },
        { name: 'Sydney', country: 'AU', state: 'New South Wales', lat: -33.86, lon: 151.2 },
        { name: 'Dubai', country: 'AE', state: 'Dubai', lat: 25.2, lon: 55.27 },
        { name: 'Singapore', country: 'SG', state: '', lat: 1.35, lon: 103.82 },
      ].filter((c) => c.name.toLowerCase().startsWith(q.toLowerCase()));
      return res.json(mockCities);
    }

    const geo = await fetchGeocode(q);
    res.json(geo.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/reverse?lat=&lon=
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!hapiKey()) return res.json([{ name: 'New York', country: 'US', lat, lon }]);

    const res2 = await axios.get(`${GEO_URL}/reverse`, {
      params: { lat, lon, limit: 1, appid: API_KEY },
    });
    res.json(res2.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
