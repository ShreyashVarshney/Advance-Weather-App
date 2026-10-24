import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart,
} from 'recharts'
import { formatTemp } from '../utils/helpers'
import './NOAAPanel.css'

const TABS = [
  { id: 'daily',   label: '📈 30-Day History' },
  { id: 'monthly', label: '📅 Monthly Summary' },
  { id: 'records', label: '🏆 All-Time Records' },
]

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="noaa-tooltip">
      <p className="tt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}{p.unit || ''}</strong>
        </p>
      ))}
    </div>
  )
}

// ─── Records Card ─────────────────────────────────────────────────────────────
function RecordsView({ records, unit }) {
  if (!records) return <div className="noaa-empty">Loading records…</div>
  const items = [
    {
      icon: '🌡️🔴',
      label: 'Record High Temp',
      value: records.recordHigh ? `${formatTemp(records.recordHigh.value, unit)}°${unit}` : 'N/A',
      date: records.recordHigh?.date,
      color: '#fb923c',
    },
    {
      icon: '🌡️🔵',
      label: 'Record Low Temp',
      value: records.recordLow ? `${formatTemp(records.recordLow.value, unit)}°${unit}` : 'N/A',
      date: records.recordLow?.date,
      color: '#60a5fa',
    },
    {
      icon: '🌧️',
      label: 'Record Rainfall',
      value: records.recordRain ? `${records.recordRain.value} mm` : 'N/A',
      date: records.recordRain?.date,
      color: '#38bdf8',
    },
  ]
  return (
    <div className="records-grid">
      {items.map((r, i) => (
        <motion.div
          key={i}
          className="record-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          style={{ '--rec-color': r.color }}
        >
          <span className="rec-icon">{r.icon}</span>
          <div>
            <small>{r.label}</small>
            <strong style={{ color: r.color }}>{r.value}</strong>
            {r.date && <p className="rec-date">{new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
          </div>
        </motion.div>
      ))}
      <div className="records-meta">
        <span>📡 Station: <strong>{records.stationName}</strong></span>
        {records.coverageStart && (
          <span>📆 Coverage: <strong>{records.coverageStart}</strong> → <strong>{records.coverageEnd}</strong></span>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NOAAPanel({ daily, monthly, records, station, unit, isMock }) {
  const [activeTab, setActiveTab] = useState('daily')

  const dailyData = daily?.data || []
  const monthlyData = monthly?.data || []

  // Transform daily for chart
  const dailyChart = dailyData.map(d => ({
    date: d.date?.slice(5), // MM-DD
    High: d.TMAX != null ? (unit === 'C' ? d.TMAX : +(d.TMAX * 9 / 5 + 32).toFixed(1)) : undefined,
    Low: d.TMIN != null ? (unit === 'C' ? d.TMIN : +(d.TMIN * 9 / 5 + 32).toFixed(1)) : undefined,
    Rain: d.PRCP ?? 0,
    Wind: d.AWND ? +(d.AWND * 3.6).toFixed(1) : undefined,
  })).filter(d => d.High != null || d.Low != null)

  const monthlyChart = monthlyData.map(d => ({
    month: d.month,
    High: d.TMAX != null ? (unit === 'C' ? d.TMAX : +(d.TMAX * 9 / 5 + 32).toFixed(1)) : undefined,
    Low: d.TMIN != null ? (unit === 'C' ? d.TMIN : +(d.TMIN * 9 / 5 + 32).toFixed(1)) : undefined,
    Rain: d.PRCP ?? 0,
  })).filter(d => d.High != null || d.Low != null)

  return (
    <motion.section
      className="noaa-panel glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      {/* Header */}
      <div className="noaa-header">
        <div className="noaa-title-row">
          <h2>🏛 NOAA Climate Data</h2>
          <div className="noaa-badges">
            {isMock && <span className="mock-badge">Demo Data</span>}
            {station && (
              <span className="station-badge" title={station.id}>
                📡 {station.name || station.id}
              </span>
            )}
          </div>
        </div>
        <p className="noaa-subtitle">Historical records via NOAA Climate Data Online API</p>
      </div>

      {/* Tabs */}
      <div className="noaa-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={activeTab === t.id ? 'active' : ''}
            onClick={() => setActiveTab(t.id)}
            id={`noaaTab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="noaa-tab-content"
        >
          {/* ── 30-Day Daily History ─────────────────────────────────────── */}
          {activeTab === 'daily' && (
            <div className="noaa-chart-wrap">
              {dailyChart.length === 0 ? (
                <div className="noaa-empty">No daily data available</div>
              ) : (
                <>
                  <p className="chart-title">Temperature (°{unit}) — Last 30 Days</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={dailyChart} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <defs>
                        <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
                      <Area type="monotone" dataKey="High" stroke="#fb923c" strokeWidth={2} fill="url(#highGrad)" dot={false} />
                      <Area type="monotone" dataKey="Low" stroke="#60a5fa" strokeWidth={2} fill="url(#lowGrad)" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>

                  <p className="chart-title" style={{ marginTop: '1rem' }}>Precipitation (mm)</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <ComposedChart data={dailyChart} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Rain" fill="#38bdf8" opacity={0.7} radius={[3, 3, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          )}

          {/* ── Monthly Summary ──────────────────────────────────────────── */}
          {activeTab === 'monthly' && (
            <div className="noaa-chart-wrap">
              {monthlyChart.length === 0 ? (
                <div className="noaa-empty">No monthly data available</div>
              ) : (
                <>
                  <p className="chart-title">Monthly Temperature Range (°{unit})</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={monthlyChart} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
                      <Bar dataKey="High" fill="rgba(251,146,60,0.6)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Low" fill="rgba(96,165,250,0.6)" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="High" stroke="#fb923c" strokeWidth={2} dot={false} legendType="none" />
                      <Line type="monotone" dataKey="Low" stroke="#60a5fa" strokeWidth={2} dot={false} legendType="none" />
                    </ComposedChart>
                  </ResponsiveContainer>

                  <p className="chart-title" style={{ marginTop: '1rem' }}>Monthly Precipitation (mm)</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={monthlyChart} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <defs>
                        <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Rain" stroke="#38bdf8" strokeWidth={2} fill="url(#rainGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          )}

          {/* ── All-Time Records ─────────────────────────────────────────── */}
          {activeTab === 'records' && <RecordsView records={records} unit={unit} />}
        </motion.div>
      </AnimatePresence>

      <div className="noaa-footer">
        <span>Source: NOAA Climate Data Online</span>
        <a href="https://www.ncei.noaa.gov/cdo-web/" target="_blank" rel="noopener noreferrer">ncei.noaa.gov/cdo-web ↗</a>
      </div>
    </motion.section>
  )
}
