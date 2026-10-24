const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 }); // 10-minute cache

// ─── Weather Code Mapping (WMO to standard weather object) ────────────────────
function mapWmoToWeather(code, isDay = 1) {
  const d = isDay ? 'd' : 'n';
  switch (code) {
    case 0:
      return { id: 800, main: 'Clear', description: 'Clear Sky', icon: `01${d}` };
    case 1:
      return { id: 801, main: 'Clear', description: 'Mainly Clear', icon: `02${d}` };
    case 2:
      return { id: 802, main: 'Clouds', description: 'Partly Cloudy', icon: `03${d}` };
    case 3:
      return { id: 804, main: 'Clouds', description: 'Overcast', icon: `04${d}` };
    case 45:
    case 48:
      return { id: 741, main: 'Fog', description: 'Fog', icon: `50${d}` };
    case 51:
    case 53:
    case 55:
      return { id: 300, main: 'Drizzle', description: 'Drizzle', icon: `09${d}` };
    case 61:
    case 63:
    case 65:
      return { id: 500, main: 'Rain', description: 'Rain', icon: `10${d}` };
    case 71:
    case 73:
    case 75:
    case 77:
      return { id: 600, main: 'Snow', description: 'Snow', icon: `13${d}` };
    case 80:
    case 81:
    case 82:
      return { id: 501, main: 'Rain', description: 'Rain Showers', icon: `10${d}` };
    case 85:
    case 86:
      return { id: 601, main: 'Snow', description: 'Snow Showers', icon: `13${d}` };
    case 95:
    case 96:
    case 99:
      return { id: 200, main: 'Thunderstorm', description: 'Thunderstorm', icon: `11${d}` };
    default:
      return { id: 800, main: 'Clear', description: 'Clear Sky', icon: `01${d}` };
  }
}

// ─── Helpers: Open-Meteo API (Single API Provider) ────────────────────────────
async function geocodeCity(city) {
  const cacheKey = `geo_${city.toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 5, language: 'en', format: 'json' },
  });
  const results = res.data.results || [];
  cache.set(cacheKey, results);
  return results;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/weather/current?city=London OR ?lat=51.5&lon=-0.12
router.get('/current', async (req, res) => {
  try {
    let { city, lat, lon } = req.query;
    let cityName = city || 'New York';
    let countryCode = 'US';

    if (city) {
      const geo = await geocodeCity(city);
      if (!geo.length) return res.status(404).json({ error: 'City not found' });
      lat = geo[0].latitude;
      lon = geo[0].longitude;
      cityName = geo[0].name;
      countryCode = geo[0].country_code || '';
    } else if (lat != null && lon != null) {
      lat = parseFloat(lat);
      lon = parseFloat(lon);
    } else {
      lat = 40.7128;
      lon = -74.006;
      cityName = 'New York';
      countryCode = 'US';
    }

    const cacheKey = `cur_${lat}_${lon}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m',
        hourly: 'visibility',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
        timezone: 'auto',
      },
    });

    const data = response.data;
    const current = data.current;
    const daily = data.daily || {};
    const hourly = data.hourly || {};
    const weather = mapWmoToWeather(current.weather_code, current.is_day);

    const sunrise = daily.sunrise?.[0] ? Math.floor(new Date(daily.sunrise[0]).getTime() / 1000) : Math.floor(Date.now() / 1000) - 18000;
    const sunset = daily.sunset?.[0] ? Math.floor(new Date(daily.sunset[0]).getTime() / 1000) : Math.floor(Date.now() / 1000) + 18000;
    const nowUnix = Math.floor(new Date(current.time).getTime() / 1000);

    const result = {
      city: cityName,
      country: countryCode,
      lat: Number(lat),
      lon: Number(lon),
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      temp_min: daily.temperature_2m_min?.[0] ?? (current.temperature_2m - 3),
      temp_max: daily.temperature_2m_max?.[0] ?? (current.temperature_2m + 3),
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.surface_pressure),
      visibility: hourly.visibility?.[0] != null ? Math.round(hourly.visibility[0]) : 10000,
      wind_speed: +(current.wind_speed_10m / 3.6).toFixed(1), // km/h to m/s
      wind_deg: current.wind_direction_10m,
      weather: [weather],
      sunrise,
      sunset,
      dt: nowUnix,
      timezone: data.utc_offset_seconds || 0,
      uv: daily.uv_index_max?.[0] ?? 4.5,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/forecast?lat=&lon=
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (lat == null || lon == null) return res.status(400).json({ error: 'Coordinates required' });

    const cacheKey = `fore_${lat}_${lon}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m',
        timezone: 'auto',
      },
    });

    const hourly = response.data.hourly;
    const list = hourly.time.slice(0, 40).map((t, idx) => {
      const code = hourly.weather_code[idx];
      const isDay = 1;
      return {
        dt: Math.floor(new Date(t).getTime() / 1000),
        main: {
          temp: hourly.temperature_2m[idx],
          feels_like: hourly.apparent_temperature[idx],
          humidity: hourly.relative_humidity_2m[idx],
          pressure: Math.round(hourly.surface_pressure[idx]),
        },
        weather: [mapWmoToWeather(code, isDay)],
        wind: {
          speed: +(hourly.wind_speed_10m[idx] / 3.6).toFixed(1),
          deg: hourly.wind_direction_10m[idx],
        },
        visibility: hourly.visibility[idx],
        pop: (hourly.precipitation_probability[idx] || 0) / 100,
      };
    });

    const result = { list };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Forecast API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/aqi?lat=&lon=
router.get('/aqi', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (lat == null || lon == null) return res.status(400).json({ error: 'Coordinates required' });

    const cacheKey = `aqi_${lat}_${lon}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    const response = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
      },
    });

    const curr = response.data.current || {};
    const usAqi = curr.us_aqi || 25;
    let aqiIndex = 1;
    if (usAqi <= 50) aqiIndex = 1;
    else if (usAqi <= 100) aqiIndex = 2;
    else if (usAqi <= 150) aqiIndex = 3;
    else if (usAqi <= 200) aqiIndex = 4;
    else aqiIndex = 5;

    const result = {
      list: [
        {
          main: { aqi: aqiIndex },
          components: {
            co: curr.carbon_monoxide || 0,
            no: 0,
            no2: curr.nitrogen_dioxide || 0,
            o3: curr.ozone || 0,
            so2: curr.sulphur_dioxide || 0,
            pm2_5: curr.pm2_5 || 0,
            pm10: curr.pm10 || 0,
            nh3: 0,
          },
        },
      ],
    };

    cache.set(cacheKey, result);
    res.json(result);
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

    const results = await geocodeCity(q);
    const formatted = results.map((item) => ({
      name: item.name,
      country: item.country_code || '',
      state: item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
