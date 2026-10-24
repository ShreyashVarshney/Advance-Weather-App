// Client-side fallback mock data for when the backend server is offline (e.g. static hosting on Netlify)

const MOCK_CITIES = [
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006, temp: 22, feels_like: 20, temp_min: 18, temp_max: 26, humidity: 65, pressure: 1013, wind_speed: 5.5, weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }] },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, temp: 16, feels_like: 15, temp_min: 12, temp_max: 18, humidity: 78, pressure: 1012, wind_speed: 4.2, weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }] },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, temp: 24, feels_like: 23, temp_min: 20, temp_max: 27, humidity: 55, pressure: 1016, wind_speed: 3.8, weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }] },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, temp: 19, feels_like: 18, temp_min: 14, temp_max: 21, humidity: 62, pressure: 1015, wind_speed: 4.0, weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }] },
  { name: 'Mumbai', country: 'IN', lat: 19.076, lon: 72.8777, temp: 31, feels_like: 35, temp_min: 27, temp_max: 33, humidity: 82, pressure: 1008, wind_speed: 6.1, weather: [{ id: 721, main: 'Haze', description: 'haze', icon: '50d' }] },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, temp: 21, feels_like: 20, temp_min: 17, temp_max: 23, humidity: 60, pressure: 1020, wind_speed: 4.9, weather: [{ id: 800, main: 'Clear', description: 'sunny', icon: '01d' }] },
]

export function getMockCurrent(params = {}) {
  const { city, lat, lon } = params
  let match = null
  if (city) {
    match = MOCK_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase())
  }
  const cityName = match ? match.name : (city ? (city.charAt(0).toUpperCase() + city.slice(1)) : 'New York')
  const country = match ? match.country : 'US'
  const latitude = lat ? parseFloat(lat) : (match ? match.lat : 40.7128)
  const longitude = lon ? parseFloat(lon) : (match ? match.lon : -74.006)

  return {
    city: cityName,
    country,
    lat: latitude,
    lon: longitude,
    temp: match ? match.temp : 22,
    feels_like: match ? match.feels_like : 20,
    temp_min: match ? match.temp_min : 18,
    temp_max: match ? match.temp_max : 26,
    humidity: match ? match.humidity : 65,
    pressure: match ? match.pressure : 1013,
    visibility: 10000,
    wind_speed: match ? match.wind_speed : 5.5,
    wind_deg: 220,
    weather: match ? match.weather : [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    sunrise: Math.floor(Date.now() / 1000) - 18000,
    sunset: Math.floor(Date.now() / 1000) + 18000,
    dt: Math.floor(Date.now() / 1000),
    timezone: -18000,
    mock: true,
  }
}

export function getMockForecast() {
  const now = Math.floor(Date.now() / 1000)
  return {
    list: Array.from({ length: 40 }, (_, i) => ({
      dt: now + i * 3 * 3600,
      main: {
        temp: Math.round(18 + Math.sin(i / 4) * 8),
        feels_like: Math.round(17 + Math.sin(i / 4) * 7),
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
      wind: { speed: +(3 + Math.random() * 4).toFixed(1), deg: 180 + Math.round(Math.random() * 90) },
      visibility: 10000,
      pop: i % 5 === 0 ? 0.6 : 0.05,
    })),
    mock: true,
  }
}

export function getMockAQI() {
  return {
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
    mock: true,
  }
}

export function getMockAutocomplete(q = '') {
  return MOCK_CITIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    .map(c => ({ name: c.name, country: c.country, lat: c.lat, lon: c.lon }))
}

// LocalStorage search history & favorites
export function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem('skycast_history') || '[]')
  } catch {
    return []
  }
}

export function saveStoredHistory(item) {
  try {
    const list = getStoredHistory()
    const filtered = list.filter(x => x.city.toLowerCase() !== item.city.toLowerCase())
    const updated = [{ ...item, _id: Date.now().toString(), lastSearched: new Date().toISOString() }, ...filtered].slice(0, 10)
    localStorage.setItem('skycast_history', JSON.stringify(updated))
    return updated[0]
  } catch {
    return item
  }
}

export function deleteStoredHistory(id) {
  try {
    const list = getStoredHistory()
    const updated = list.filter(x => x._id !== id)
    localStorage.setItem('skycast_history', JSON.stringify(updated))
  } catch {
    // ignore
  }
  return { ok: true }
}

export function getStoredFavorites() {
  try {
    return JSON.parse(localStorage.getItem('skycast_favorites') || '[]')
  } catch {
    return []
  }
}

export function saveStoredFavorite(item) {
  try {
    const list = getStoredFavorites()
    const exists = list.some(x => x.city.toLowerCase() === item.city.toLowerCase())
    if (exists) return list.find(x => x.city.toLowerCase() === item.city.toLowerCase())
    const updated = [{ ...item, _id: Date.now().toString() }, ...list]
    localStorage.setItem('skycast_favorites', JSON.stringify(updated))
    return updated[0]
  } catch {
    return item
  }
}

export function deleteStoredFavorite(id) {
  try {
    const list = getStoredFavorites()
    const updated = list.filter(x => x._id !== id)
    localStorage.setItem('skycast_favorites', JSON.stringify(updated))
  } catch {
    // ignore
  }
  return { ok: true }
}

// NOAA Mock Data
export function getMockStation() {
  return {
    mock: true,
    id: 'GHCND:USW00094728',
    name: 'NEW YORK CENTRAL PARK',
    latitude: 40.7789,
    longitude: -73.9692,
    elevation: 42.7,
    mindate: '1869-01-01',
    maxdate: new Date().toISOString().split('T')[0],
  }
}

export function getMockDaily() {
  const data = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (30 - i))
    const base = 18 + Math.sin(i / 6) * 8
    return {
      date: d.toISOString().split('T')[0],
      TMAX: +(base + 4 + Math.random() * 3).toFixed(1),
      TMIN: +(base - 3 - Math.random() * 3).toFixed(1),
      PRCP: +(Math.random() > 0.7 ? Math.random() * 15 : 0).toFixed(1),
      AWND: +(3 + Math.random() * 8).toFixed(1),
      SNOW: 0,
    }
  })
  return { mock: true, data }
}

export function getMockMonthly() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthBase = [6, 8, 12, 17, 22, 27, 30, 29, 25, 18, 12, 7]
  const data = months.map((month, i) => ({
    month,
    TMAX: +(monthBase[i] + 3 + Math.random() * 2).toFixed(1),
    TMIN: +(monthBase[i] - 5 - Math.random() * 2).toFixed(1),
    PRCP: +(30 + Math.random() * 40).toFixed(1),
  }))
  return { mock: true, data, year: new Date().getFullYear() - 1 }
}

export function getMockRecords() {
  return {
    mock: true,
    stationName: 'NEW YORK CENTRAL PARK',
    recordHigh: { value: 41.1, date: '1936-07-09' },
    recordLow: { value: -26.1, date: '1934-02-09' },
    recordRain: { value: 200.7, date: '1882-10-08' },
  }
}
