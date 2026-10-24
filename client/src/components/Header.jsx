import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Star, History, X, Thermometer } from 'lucide-react'
import { weatherApi } from '../services/api'
import './Header.css'

export default function Header({ onSearch, onGeolocate, onToggleUnit, unit, history, favorites, onDeleteHistory, onDeleteFavorite, onSelectFavorite }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [tab, setTab] = useState('search') // 'search' | 'history' | 'favorites'
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await weatherApi.getAutocomplete(query)
        setSuggestions(data)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const handleSelect = (city, lat, lon) => {
    setQuery(city)
    setShowDropdown(false)
    if (lat && lon) onSearch(city)
    else onSearch(city)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setShowDropdown(false)
    }
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <span className="logo-emoji">🌤️</span>
          <span className="logo-text">SkyCast</span>
        </div>

        {/* Search */}
        <div className="search-area">
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                id="citySearch"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search city..."
                autoComplete="off"
              />
              {query && (
                <button type="button" className="clear-btn" onClick={() => { setQuery(''); setSuggestions([]) }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="search-btn" id="searchSubmit">Go</button>
            <button type="button" className="geo-btn" id="geoBtn" onClick={onGeolocate} title="Use my location">
              <MapPin size={16} />
            </button>
          </form>

          {/* Dropdown */}
          {showDropdown && (
            <div className="search-dropdown" onMouseDown={e => e.preventDefault()}>
              <div className="dropdown-tabs">
                <button className={tab === 'search' ? 'active' : ''} onClick={() => setTab('search')}><Search size={12}/> Results</button>
                <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><History size={12}/> Recent</button>
                <button className={tab === 'favorites' ? 'active' : ''} onClick={() => setTab('favorites')}><Star size={12}/> Favorites</button>
              </div>

              {tab === 'search' && (
                <ul className="suggestion-list">
                  {loading && <li className="dd-info">Searching…</li>}
                  {!loading && suggestions.length === 0 && query.length >= 2 && <li className="dd-info">No results</li>}
                  {suggestions.map((s, i) => (
                    <li key={i} onClick={() => handleSelect(s.name, s.lat, s.lon)}>
                      <MapPin size={12} />
                      <span>{s.name}</span>
                      <small>{s.state ? `${s.state}, ` : ''}{s.country}</small>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'history' && (
                <ul className="suggestion-list">
                  {history.length === 0 && <li className="dd-info">No recent searches</li>}
                  {history.map((h, i) => (
                    <li key={i} className="has-action">
                      <span onClick={() => handleSelect(h.city)}><History size={12}/> {h.city}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteHistory(h._id) }}><X size={12}/></button>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'favorites' && (
                <ul className="suggestion-list">
                  {favorites.length === 0 && <li className="dd-info">No favorite cities yet</li>}
                  {favorites.map((f, i) => (
                    <li key={i} className="has-action">
                      <span onClick={() => { onSelectFavorite(f.city); setShowDropdown(false) }}><Star size={12}/> {f.city}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteFavorite(f._id) }}><X size={12}/></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Unit Toggle */}
        <div className="unit-toggle">
          <button
            id="celsiusBtn"
            className={unit === 'C' ? 'active' : ''}
            onClick={() => unit !== 'C' && onToggleUnit()}
          >°C</button>
          <button
            id="fahrenheitBtn"
            className={unit === 'F' ? 'active' : ''}
            onClick={() => unit !== 'F' && onToggleUnit()}
          >°F</button>
        </div>
      </div>

      {/* Click outside to close */}
      {showDropdown && <div className="backdrop" onClick={() => setShowDropdown(false)} />}
    </header>
  )
}
