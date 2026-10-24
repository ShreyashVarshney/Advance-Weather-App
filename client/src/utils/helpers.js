// Weather condition → emoji + gradient theme
export const WEATHER_THEMES = {
  // Clear
  800: { icon: '☀️', gradient: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)', label: 'Sunny', anim: 'sunny' },
  // Clouds
  801: { icon: '🌤️', gradient: 'linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)', label: 'Partly Cloudy', anim: 'partly-cloudy' },
  802: { icon: '⛅', gradient: 'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)', label: 'Cloudy', anim: 'cloudy' },
  803: { icon: '🌥️', gradient: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', label: 'Mostly Cloudy', anim: 'cloudy' },
  804: { icon: '☁️', gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', label: 'Overcast', anim: 'cloudy' },
  // Drizzle
  300: { icon: '🌦️', gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', label: 'Drizzle', anim: 'rain' },
  301: { icon: '🌦️', gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', label: 'Drizzle', anim: 'rain' },
  302: { icon: '🌦️', gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', label: 'Heavy Drizzle', anim: 'rain' },
  // Rain
  500: { icon: '🌧️', gradient: 'linear-gradient(135deg,#373b44 0%,#4286f4 100%)', label: 'Rain', anim: 'rain' },
  501: { icon: '🌧️', gradient: 'linear-gradient(135deg,#373b44 0%,#4286f4 100%)', label: 'Moderate Rain', anim: 'rain' },
  502: { icon: '⛈️', gradient: 'linear-gradient(135deg,#232526 0%,#414345 100%)', label: 'Heavy Rain', anim: 'rain' },
  511: { icon: '🌨️', gradient: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', label: 'Freezing Rain', anim: 'snow' },
  // Thunderstorm
  200: { icon: '⛈️', gradient: 'linear-gradient(135deg,#1c1c2e 0%,#2d3561 100%)', label: 'Thunderstorm', anim: 'storm' },
  201: { icon: '⛈️', gradient: 'linear-gradient(135deg,#1c1c2e 0%,#2d3561 100%)', label: 'Thunderstorm', anim: 'storm' },
  202: { icon: '🌩️', gradient: 'linear-gradient(135deg,#1c1c2e 0%,#2d3561 100%)', label: 'Heavy Storm', anim: 'storm' },
  // Snow
  600: { icon: '❄️', gradient: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', label: 'Snow', anim: 'snow' },
  601: { icon: '🌨️', gradient: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', label: 'Snow', anim: 'snow' },
  602: { icon: '❄️', gradient: 'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)', label: 'Heavy Snow', anim: 'snow' },
  // Atmosphere
  701: { icon: '🌫️', gradient: 'linear-gradient(135deg,#606c88 0%,#3f4c6b 100%)', label: 'Mist', anim: 'fog' },
  741: { icon: '🌫️', gradient: 'linear-gradient(135deg,#606c88 0%,#3f4c6b 100%)', label: 'Fog', anim: 'fog' },
  781: { icon: '🌪️', gradient: 'linear-gradient(135deg,#373b44 0%,#4286f4 100%)', label: 'Tornado', anim: 'storm' },
}

export function getWeatherTheme(weatherId) {
  return WEATHER_THEMES[weatherId] || WEATHER_THEMES[800]
}

export function formatTemp(temp, unit = 'C') {
  if (temp == null) return '--'
  if (unit === 'F') return `${Math.round(temp * 9 / 5 + 32)}`
  return `${Math.round(temp)}`
}

export function formatTime(unix, timezone = 0) {
  const date = new Date((unix + timezone) * 1000)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

export function formatDate(unix, timezone = 0) {
  const date = new Date((unix + timezone) * 1000)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export function formatDay(unix, timezone = 0) {
  const date = new Date((unix + timezone) * 1000)
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

export function formatHour(unix, timezone = 0) {
  const date = new Date((unix + timezone) * 1000)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

export function windDirection(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function getAQILabel(aqi) {
  const labels = { 1: { label: 'Good', color: '#22c55e' }, 2: { label: 'Fair', color: '#84cc16' }, 3: { label: 'Moderate', color: '#eab308' }, 4: { label: 'Poor', color: '#f97316' }, 5: { label: 'Very Poor', color: '#ef4444' } }
  return labels[aqi] || { label: 'Unknown', color: '#6b7280' }
}

export function getUVLabel(uv) {
  if (uv <= 2) return { label: 'Low', color: '#22c55e' }
  if (uv <= 5) return { label: 'Moderate', color: '#eab308' }
  if (uv <= 7) return { label: 'High', color: '#f97316' }
  if (uv <= 10) return { label: 'Very High', color: '#ef4444' }
  return { label: 'Extreme', color: '#8b5cf6' }
}

export function getVisibilityLabel(meters) {
  if (meters >= 10000) return 'Excellent'
  if (meters >= 5000) return 'Good'
  if (meters >= 2000) return 'Moderate'
  if (meters >= 1000) return 'Poor'
  return 'Very Poor'
}

export function getPressureLabel(hpa) {
  if (hpa < 1000) return 'Low'
  if (hpa > 1020) return 'High'
  return 'Normal'
}

// Group forecast list by day
export function groupForecastByDay(list) {
  const days = {}
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString()
    if (!days[date]) days[date] = []
    days[date].push(item)
  })
  return Object.values(days)
}
