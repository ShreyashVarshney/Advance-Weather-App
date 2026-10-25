import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useWeather } from './hooks/useWeather'
import Header from './components/Header'
import HeroCard from './components/HeroCard'
import StatsGrid from './components/StatsGrid'
import AQICard from './components/AQICard'
import HourlyForecast from './components/HourlyForecast'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

function LoadingSpinner() {
  return (
    <div className="loading-state">
      <div className="spinner-ring" />
      <p>Fetching weather data…</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="error-state glass-card">
      <span>⚠️</span>
      <p>{message}</p>
    </div>
  )
}

export default function App() {
  const {
    current, forecast, aqi,
    history, favorites,
    isLoading, isError, error,
    unit, searchCity, searchByCoords,
    addFavorite, toggleUnit,
    deleteHistory, deleteFavorite,
  } = useWeather()

  // Geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      return
    }
    toast.loading('Getting your location…', { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.success('Location found!', { id: 'geo' })
        searchByCoords(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        toast.error('Location access denied. Please search manually.', { id: 'geo' })
      }
    )
  }

  // Particle canvas background
  useEffect(() => {
    const canvas = document.getElementById('particleCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    }))
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167,139,250,${p.o})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > w) p.dx *= -1
        if (p.y < 0 || p.y > h) p.dy *= -1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div className="app-root">
      <canvas id="particleCanvas" className="particle-canvas" />

      <Header
        onSearch={searchCity}
        onGeolocate={handleGeolocate}
        onToggleUnit={toggleUnit}
        unit={unit}
        history={history}
        favorites={favorites}
        onDeleteHistory={deleteHistory}
        onDeleteFavorite={deleteFavorite}
        onSelectFavorite={searchCity}
      />

      <main className="main-content">
        <div className="content-wrapper">
          <AnimatePresence mode="wait">
            {isLoading && <LoadingSpinner key="loading" />}
            {isError && !isLoading && (
              <ErrorState key="error" message={error?.message || 'Failed to fetch weather data'} />
            )}
            {!isLoading && current && (
              <motion.div
                key={`${current.city}-${unit}`}
                className="weather-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HeroCard
                  data={current}
                  unit={unit}
                  onAddFavorite={addFavorite}
                  isFavorite={favorites.some(f => f.city?.toLowerCase() === current?.city?.toLowerCase())}
                />
                <StatsGrid data={current} unit={unit} />
                {aqi && <AQICard data={aqi} />}
                {forecast && <HourlyForecast data={forecast} unit={unit} timezone={current.timezone} />}
                {forecast && <WeeklyForecast data={forecast} unit={unit} timezone={current.timezone} />}

                {/* Map */}
                <motion.section
                  className="map-section glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <div className="section-header">
                    <h2>🗺 Location Map</h2>
                    <span className="section-sub">{current.city}, {current.country}</span>
                  </div>
                  <div className="map-wrap">
                    <iframe
                      id="mapIframe"
                      title="Location Map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${current.lon - 0.2},${current.lat - 0.2},${current.lon + 0.2},${current.lat + 0.2}&layer=mapnik&marker=${current.lat},${current.lon}`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  )
}
