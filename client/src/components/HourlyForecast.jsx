import { motion } from 'framer-motion'
import { formatTemp, formatHour, getWeatherTheme } from '../utils/helpers'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './HourlyForecast.css'

export default function HourlyForecast({ data, unit, timezone = 0 }) {
  if (!data?.list) return null

  const hourly = data.list.slice(0, 9) // next 27 hours
  const chartData = hourly.map(h => ({
    time: formatHour(h.dt, timezone),
    temp: unit === 'C' ? Math.round(h.main.temp) : Math.round(h.main.temp * 9 / 5 + 32),
    humidity: h.main.humidity,
    pop: Math.round((h.pop || 0) * 100),
  }))

  return (
    <motion.section
      className="hourly-section glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <div className="section-header">
        <h2>⏱ Hourly Forecast</h2>
        <span className="section-sub">Next 27 hours</span>
      </div>

      {/* Scroll cards */}
      <div className="hourly-scroll" id="hourlyScroll">
        {hourly.map((h, i) => {
          const theme = getWeatherTheme(h.weather[0].id)
          return (
            <motion.div
              key={h.dt}
              className="hour-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <span className="hour-time">{formatHour(h.dt, timezone)}</span>
              <span className="hour-icon">{theme.icon}</span>
              <span className="hour-temp">{formatTemp(h.main.temp, unit)}°</span>
              {h.pop > 0.05 && (
                <span className="hour-pop">💧 {Math.round(h.pop * 100)}%</span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Temp chart */}
      <div className="hourly-chart">
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,12,41,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
              formatter={(val, name) => [`${val}${name === 'temp' ? `°${unit}` : '%'}`, name === 'temp' ? 'Temp' : 'Humidity']}
            />
            <Area type="monotone" dataKey="temp" stroke="#7c3aed" strokeWidth={2} fill="url(#tempGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
