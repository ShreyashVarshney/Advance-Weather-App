// Live real-time Weather, Forecast, and Air Quality powered by Open-Meteo API
// Free, public, accurate, no API key required.

function mapWmoToWeather(code, isDay = 1) {
  const d = isDay ? 'd' : 'n'
  switch (code) {
    case 0:
      return { id: 800, main: 'Clear', description: 'Clear Sky', icon: `01${d}` }
    case 1:
      return { id: 801, main: 'Clear', description: 'Mainly Clear', icon: `02${d}` }
    case 2:
      return { id: 802, main: 'Clouds', description: 'Partly Cloudy', icon: `03${d}` }
    case 3:
      return { id: 804, main: 'Clouds', description: 'Overcast', icon: `04${d}` }
    case 45:
    case 48:
      return { id: 741, main: 'Fog', description: 'Fog', icon: `50${d}` }
    case 51:
    case 53:
    case 55:
      return { id: 300, main: 'Drizzle', description: 'Drizzle', icon: `09${d}` }
    case 61:
    case 63:
    case 65:
      return { id: 500, main: 'Rain', description: 'Rain', icon: `10${d}` }
    case 71:
    case 73:
    case 75:
    case 77:
      return { id: 600, main: 'Snow', description: 'Snow', icon: `13${d}` }
    case 80:
    case 81:
    case 82:
      return { id: 501, main: 'Rain', description: 'Rain Showers', icon: `10${d}` }
    case 85:
    case 86:
      return { id: 601, main: 'Snow', description: 'Snow Showers', icon: `13${d}` }
    case 95:
    case 96:
    case 99:
      return { id: 200, main: 'Thunderstorm', description: 'Thunderstorm', icon: `11${d}` }
    default:
      return { id: 800, main: 'Clear', description: 'Clear Sky', icon: `01${d}` }
  }
}

function calculateAqiIndex(usAqi) {
  if (usAqi <= 50) return 1
  if (usAqi <= 100) return 2
  if (usAqi <= 150) return 3
  if (usAqi <= 200) return 4
  return 5
}

export async function geocodeCity(cityName) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`)
  const data = await res.json()
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found`)
  }
  return data.results[0]
}

export async function reverseGeocodeCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
    const data = await res.json()
    return {
      name: data.city || data.locality || data.principalSubdivision || 'Current Location',
      country: data.countryCode || '',
    }
  } catch {
    return { name: 'Location', country: '' }
  }
}

export async function fetchLiveCurrent(params = {}) {
  let { city, lat, lon } = params
  let cityName = city || 'New York'
  let countryCode = 'US'

  if (city) {
    const geo = await geocodeCity(city)
    lat = geo.latitude
    lon = geo.longitude
    cityName = geo.name
    countryCode = geo.country_code || ''
  } else if (lat != null && lon != null) {
    const rev = await reverseGeocodeCoords(lat, lon)
    cityName = rev.name
    countryCode = rev.country
  } else {
    lat = 40.7128
    lon = -74.006
    cityName = 'New York'
    countryCode = 'US'
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`
  const res = await fetch(url)
  const data = await res.json()

  const current = data.current
  const daily = data.daily || {}
  const hourly = data.hourly || {}
  const weather = mapWmoToWeather(current.weather_code, current.is_day)

  const sunrise = daily.sunrise?.[0] ? Math.floor(new Date(daily.sunrise[0]).getTime() / 1000) : Math.floor(Date.now() / 1000) - 18000
  const sunset = daily.sunset?.[0] ? Math.floor(new Date(daily.sunset[0]).getTime() / 1000) : Math.floor(Date.now() / 1000) + 18000
  const nowUnix = Math.floor(new Date(current.time).getTime() / 1000)

  return {
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
    visibility: (hourly.visibility?.[0] != null ? Math.round(hourly.visibility[0]) : 10000),
    wind_speed: current.wind_speed_10m / 3.6, // convert km/h to m/s
    wind_deg: current.wind_direction_10m,
    weather: [weather],
    sunrise,
    sunset,
    dt: nowUnix,
    timezone: data.utc_offset_seconds || 0,
    uv: daily.uv_index_max?.[0] ?? 4.5,
    mock: false,
  }
}

export async function fetchLiveForecast(params = {}) {
  const { lat, lon } = params
  if (lat == null || lon == null) return null

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m&timezone=auto`
  const res = await fetch(url)
  const data = await res.json()
  const hourly = data.hourly || {}

  const now = new Date()
  const times = hourly.time || []
  let startIndex = times.findIndex(t => new Date(t) >= now)
  if (startIndex === -1) startIndex = 0

  const list = []
  for (let i = startIndex; i < Math.min(startIndex + 40, times.length); i++) {
    const t = times[i]
    const dt = Math.floor(new Date(t).getTime() / 1000)
    const wCode = hourly.weather_code[i]
    const hour = new Date(t).getHours()
    const isDay = hour >= 6 && hour < 20 ? 1 : 0
    const w = mapWmoToWeather(wCode, isDay)

    list.push({
      dt,
      main: {
        temp: hourly.temperature_2m[i],
        feels_like: hourly.apparent_temperature[i],
        temp_min: hourly.temperature_2m[i],
        temp_max: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i],
        pressure: Math.round(hourly.surface_pressure[i]),
      },
      weather: [w],
      wind: {
        speed: hourly.wind_speed_10m[i] / 3.6,
        deg: hourly.wind_direction_10m[i],
      },
      pop: (hourly.precipitation_probability?.[i] || 0) / 100,
    })
  }

  return { list, mock: false }
}

export async function fetchLiveAQI(params = {}) {
  const { lat, lon } = params
  if (lat == null || lon == null) return null

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`
    const res = await fetch(url)
    const data = await res.json()
    const cur = data.current || {}

    const aqiNum = calculateAqiIndex(cur.us_aqi || 30)

    return {
      list: [
        {
          main: { aqi: aqiNum },
          components: {
            pm2_5: +(cur.pm2_5 || 5).toFixed(1),
            pm10: +(cur.pm10 || 10).toFixed(1),
            co: +(cur.carbon_monoxide || 150).toFixed(1),
            no2: +(cur.nitrogen_dioxide || 10).toFixed(1),
            so2: +(cur.sulphur_dioxide || 1).toFixed(1),
            o3: +(cur.ozone || 50).toFixed(1),
          },
        },
      ],
      mock: false,
    }
  } catch {
    return {
      list: [{
        main: { aqi: 1 },
        components: { pm2_5: 5, pm10: 10, co: 150, no2: 10, so2: 1, o3: 50 },
      }],
      mock: false,
    }
  }
}

export async function fetchLiveAutocomplete(query = '') {
  if (!query || query.trim().length < 2) return []
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`)
    const data = await res.json()
    if (!data.results) return []
    return data.results.map(r => ({
      name: r.name,
      country: r.country_code || '',
      state: r.admin1 || '',
      lat: r.latitude,
      lon: r.longitude,
    }))
  } catch {
    return []
  }
}
