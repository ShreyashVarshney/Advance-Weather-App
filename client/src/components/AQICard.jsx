import { motion } from 'framer-motion'
import { getAQILabel } from '../utils/helpers'
import './AQICard.css'

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'μg/m³', max: 75 },
  { key: 'pm10', label: 'PM10', unit: 'μg/m³', max: 150 },
  { key: 'o3', label: 'O₃', unit: 'μg/m³', max: 200 },
  { key: 'no2', label: 'NO₂', unit: 'μg/m³', max: 200 },
  { key: 'so2', label: 'SO₂', unit: 'μg/m³', max: 100 },
  { key: 'co', label: 'CO', unit: 'μg/m³', max: 10000 },
]

export default function AQICard({ data }) {
  if (!data?.list?.[0]) return null

  const item = data.list[0]
  const aqi = item.main.aqi
  const comps = item.components
  const aqiInfo = getAQILabel(aqi)
  const pct = ((aqi - 1) / 4) * 100

  return (
    <motion.section
      className="aqi-card glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      <div className="section-header">
        <h2>🌿 Air Quality Index</h2>
        <span className="aqi-badge" style={{ background: `${aqiInfo.color}22`, color: aqiInfo.color, borderColor: `${aqiInfo.color}44` }}>
          {aqiInfo.label}
        </span>
      </div>

      <div className="aqi-bar-wrap">
        <div className="aqi-spectrum" />
        <motion.div
          className="aqi-indicator"
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(pct, 96)}%` }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        >
          <div className="aqi-dot" style={{ background: aqiInfo.color }} />
          <span className="aqi-num">{aqi}</span>
        </motion.div>
      </div>
      <div className="aqi-scale-labels">
        <span>Good</span><span>Fair</span><span>Moderate</span><span>Poor</span><span>Very Poor</span>
      </div>

      <div className="aqi-pollutants">
        {POLLUTANTS.map(p => {
          const val = comps[p.key] || 0
          const pctFill = Math.min((val / p.max) * 100, 100)
          return (
            <div className="pollutant" key={p.key}>
              <div className="poll-top">
                <span>{p.label}</span>
                <span>{val.toFixed(2)} {p.unit}</span>
              </div>
              <div className="poll-bar">
                <motion.div
                  className="poll-fill"
                  style={{ '--color': aqiInfo.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pctFill}%` }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
