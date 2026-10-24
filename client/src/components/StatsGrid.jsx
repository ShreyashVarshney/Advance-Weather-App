import { motion } from 'framer-motion'
import { formatTemp, windDirection, getUVLabel, getVisibilityLabel, getPressureLabel } from '../utils/helpers'
import './StatsGrid.css'

const StatCard = ({ icon, label, value, sub, progress, delay }) => (
  <motion.div
    className="stat-card glass-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <small>{label}</small>
      <strong>{value}</strong>
      {sub && <p className="stat-sub">{sub}</p>}
      {progress !== undefined && (
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8 }}
          />
        </div>
      )}
    </div>
  </motion.div>
)

export default function StatsGrid({ data, unit }) {
  if (!data) return null

  const windKmh = (data.wind_speed * 3.6).toFixed(1)
  const windMph = (data.wind_speed * 2.237).toFixed(1)
  const windVal = unit === 'C' ? `${windKmh} km/h` : `${windMph} mph`
  const visKm = (data.visibility / 1000).toFixed(1)
  const uvLabel = getUVLabel(data.uv || 4)
  const visLabel = getVisibilityLabel(data.visibility)
  const pressLabel = getPressureLabel(data.pressure)
  const dewPoint = data.temp - ((100 - data.humidity) / 5)

  return (
    <section className="stats-grid">
      <StatCard icon="💧" label="Humidity" value={`${data.humidity}%`}
        progress={data.humidity} sub={data.humidity > 70 ? 'High — muggy air' : 'Comfortable'} delay={0.05} />
      <StatCard icon="🌬️" label="Wind Speed" value={windVal}
        sub={`${windDirection(data.wind_deg)} · ${data.wind_deg}°`} delay={0.1} />
      <StatCard icon="👁️" label="Visibility" value={`${visKm} km`}
        sub={visLabel} delay={0.15} />
      <StatCard icon="🧭" label="Pressure" value={`${data.pressure} hPa`}
        sub={pressLabel} delay={0.2} />
      <StatCard icon="☀️" label="UV Index" value={data.uv?.toFixed(1) || '4.0'}
        sub={<span style={{ color: uvLabel.color }}>{uvLabel.label}</span>} delay={0.25} />
      <StatCard icon="🌡️" label="Dew Point" value={`${formatTemp(dewPoint, unit)}°${unit}`}
        sub="Atmospheric moisture" delay={0.3} />
    </section>
  )
}
