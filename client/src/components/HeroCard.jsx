import { motion } from 'framer-motion'
import { Heart, Wind, Droplets } from 'lucide-react'
import { formatTemp, formatTime, formatDate, windDirection, getWeatherTheme } from '../utils/helpers'
import './HeroCard.css'

export default function HeroCard({ data, unit, onAddFavorite, isFavorite = false }) {
  if (!data) return null

  const theme = getWeatherTheme(data.weather?.[0]?.id)
  const tz = data.timezone || 0

  return (
    <motion.section
      className="hero-card glass-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ '--hero-gradient': theme.gradient }}
    >
      {/* Background glow */}
      <div className="hero-glow" style={{ background: theme.gradient }} />

      <div className="hero-content">
        {/* Left */}
        <div className="hero-left">
          <div className="hero-location">
            <h1 className="hero-city">{data.city}</h1>
            <p className="hero-country">{data.country}</p>
            <p className="hero-date">{formatDate(data.dt, tz)}</p>
            {data.mock && <span className="mock-badge">Demo Data</span>}
          </div>

          <div className="hero-temp-block">
            <span className="hero-temp">{formatTemp(data.temp, unit)}</span>
            <span className="hero-unit">°{unit}</span>
          </div>

          <p className="hero-desc">{data.weather?.[0]?.description}</p>
          <p className="hero-feels">Feels like {formatTemp(data.feels_like, unit)}°</p>

          <div className="hero-range">
            <span className="temp-high">↑ {formatTemp(data.temp_max, unit)}°</span>
            <span className="temp-low">↓ {formatTemp(data.temp_min, unit)}°</span>
          </div>

          {/* Quick stats */}
          <div className="hero-quick-stats">
            <div className="qstat">
              <Droplets size={14} />
              <span>{data.humidity}%</span>
            </div>
            <div className="qstat">
              <Wind size={14} />
              <span>{unit === 'C' ? `${(data.wind_speed * 3.6).toFixed(1)} km/h` : `${(data.wind_speed * 2.237).toFixed(1)} mph`}</span>
            </div>
            <div className="qstat">
              <span>💧</span>
              <span>{(data.visibility / 1000).toFixed(1)} km</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hero-right">
          <button
            className={`fav-btn ${isFavorite ? 'active' : ''}`}
            id="addFavoriteBtn"
            onClick={onAddFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={18}
              fill={isFavorite ? '#f43f5e' : 'none'}
              color={isFavorite ? '#f43f5e' : 'currentColor'}
            />
          </button>

          <div className={`weather-anim-wrap anim-${theme.anim}`}>
            <div className="weather-big-icon">{theme.icon}</div>
            {theme.anim === 'rain' && (
              <div className="rain-drops">
                {[...Array(8)].map((_, i) => <div key={i} className="drop" style={{ '--i': i }} />)}
              </div>
            )}
            {theme.anim === 'snow' && (
              <div className="snow-flakes">
                {[...Array(8)].map((_, i) => <div key={i} className="flake" style={{ '--i': i }}>❄</div>)}
              </div>
            )}
            {theme.anim === 'sunny' && <div className="sun-rays" />}
            {theme.anim === 'storm' && <div className="lightning">⚡</div>}
          </div>

          <div className="sun-times">
            <div className="sun-item">
              <span>🌅</span>
              <div>
                <small>Sunrise</small>
                <strong id="sunriseTime">{formatTime(data.sunrise, tz)}</strong>
              </div>
            </div>
            <div className="sun-divider" />
            <div className="sun-item">
              <span>🌇</span>
              <div>
                <small>Sunset</small>
                <strong id="sunsetTime">{formatTime(data.sunset, tz)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
