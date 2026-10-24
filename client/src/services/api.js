import axios from 'axios'
import {
  getMockCurrent,
  getMockForecast,
  getMockAQI,
  getMockAutocomplete,
  getStoredHistory,
  saveStoredHistory,
  deleteStoredHistory,
  getStoredFavorites,
  saveStoredFavorite,
  deleteStoredFavorite,
} from './mockFallback'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: API_BASE, timeout: 6000 })

export const weatherApi = {
  getCurrent: async (params) => {
    try {
      const res = await api.get('/weather/current', { params })
      return res.data
    } catch {
      return getMockCurrent(params)
    }
  },
  getForecast: async (params) => {
    try {
      const res = await api.get('/weather/forecast', { params })
      return res.data
    } catch {
      return getMockForecast(params)
    }
  },
  getAQI: async (params) => {
    try {
      const res = await api.get('/weather/aqi', { params })
      return res.data
    } catch {
      return getMockAQI(params)
    }
  },
  getAutocomplete: async (q) => {
    try {
      const res = await api.get('/weather/autocomplete', { params: { q } })
      return res.data
    } catch {
      return getMockAutocomplete(q)
    }
  },
  reverseGeocode: async (lat, lon) => {
    try {
      const res = await api.get('/weather/reverse', { params: { lat, lon } })
      return res.data
    } catch {
      return [{ name: 'New York', country: 'US' }]
    }
  },
}

export const searchApi = {
  getHistory: async () => {
    try {
      const res = await api.get('/search/history')
      return res.data
    } catch {
      return getStoredHistory()
    }
  },
  saveHistory: async (data) => {
    try {
      const res = await api.post('/search/history', data)
      return res.data
    } catch {
      return saveStoredHistory(data)
    }
  },
  deleteHistory: async (id) => {
    try {
      const res = await api.delete(`/search/history/${id}`)
      return res.data
    } catch {
      return deleteStoredHistory(id)
    }
  },
  getFavorites: async () => {
    try {
      const res = await api.get('/search/favorites')
      return res.data
    } catch {
      return getStoredFavorites()
    }
  },
  saveFavorite: async (data) => {
    try {
      const res = await api.post('/search/favorites', data)
      return res.data
    } catch {
      return saveStoredFavorite(data)
    }
  },
  deleteFavorite: async (id) => {
    try {
      const res = await api.delete(`/search/favorites/${id}`)
      return res.data
    } catch {
      return deleteStoredFavorite(id)
    }
  },
}
