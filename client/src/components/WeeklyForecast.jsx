import { motion } from 'framer-motion'
import { formatTemp, formatDay, getWeatherTheme, groupForecastByDay } from '../utils/helpers'
import './WeeklyForecast.css'

export default function WeeklyForecast({ data, unit, timezone = 0 }) {
  if (!data?.list) return null

  const days = groupForecastByDay(data.list).slice(0, 7)

  return (
    <motion.section
      className="weekly-section glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
    >
      <div className="section-header">
        <h2>📅 7-Day Forecast</h2>
      </div>
      <div className="weekly-list" id="weeklyList">
        {days.map((dayItems, i) => {
          const temps = dayItems.map(d => d.main.temp)
          const maxTemp = Math.max(...temps)
          const minTemp = Math.min(...temps)
          const midItem = dayItems[Math.floor(dayItems.length / 2)]
          const theme = getWeatherTheme(midItem.weather[0].id)
          const avgPop = dayItems.reduce((a, d) => a + (d.pop || 0), 0) / dayItems.length
          const dayLabel = i === 0 ? 'Today' : formatDay(dayItems[0].dt, timezone)

          return (
            <motion.div
              key={i}
              className="day-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.45 }}
            >
              <span className="day-name">{dayLabel}</span>
              <span className="day-icon">{theme.icon}</span>
              <span className="day-desc">{midItem.weather[0].description}</span>
              {avgPop > 0.1 && <span className="day-pop">💧 {Math.round(avgPop * 100)}%</span>}
              <div className="day-temps">
                <span className="day-low">{formatTemp(minTemp, unit)}°</span>
                <div className="day-bar-wrap">
                  <div className="day-bar" />
                </div>
                <span className="day-high">{formatTemp(maxTemp, unit)}°</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
