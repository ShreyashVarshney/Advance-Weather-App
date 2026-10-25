import axios from 'axios'
import {
  fetchLiveCurrent,
  fetchLiveForecast,
  fetchLiveAQI,
  fetchLiveAutocomplete,
  reverseGeocodeCoords,
} from './openMeteoService'
import {
  getStoredHistory,
  saveStoredHistory,
  deleteStoredHistory,
  getStoredFavorites,
  saveStoredFavorite,
  deleteStoredFavorite,
} from './mockFallback'

const API_BASE = '/api'

export const weatherApi = {
  getCurrent: async (params) => {
    return await fetchLiveCurrent(params)
  },
  getForecast: async (params) => {
    return await fetchLiveForecast(params)
  },
  getAQI: async (params) => {
    return await fetchLiveAQI(params)
  },
  getAutocomplete: async (q) => {
    return await fetchLiveAutocomplete(q)
  },
  reverseGeocode: async (lat, lon) => {
    const info = await reverseGeocodeCoords(lat, lon)
    return [info]
  },
}

export const searchApi = {
  getHistory: async () => {
    try {
      const res = await axios.get(`${API_BASE}/search/history`)
      return res.data
    } catch (err) {
      console.warn('Backend history fetch failed, falling back to local storage', err)
      return getStoredHistory()
    }
  },
  saveHistory: async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/search/history`, data)
      saveStoredHistory(data)
      return res.data
    } catch (err) {
      console.warn('Backend save history failed, falling back to local storage', err)
      return saveStoredHistory(data)
    }
  },
  deleteHistory: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/search/history/${id}`)
      deleteStoredHistory(id)
      return res.data
    } catch (err) {
      return deleteStoredHistory(id)
    }
  },
  getFavorites: async () => {
    try {
      const res = await axios.get(`${API_BASE}/search/favorites`)
      return res.data
    } catch (err) {
      console.warn('Backend favorites fetch failed, falling back to local storage', err)
      return getStoredFavorites()
    }
  },
  saveFavorite: async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/search/favorites`, data)
      saveStoredFavorite(data)
      return res.data
    } catch (err) {
      console.warn('Backend save favorite failed, falling back to local storage', err)
      return saveStoredFavorite(data)
    }
  },
  deleteFavorite: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/search/favorites/${id}`)
      deleteStoredFavorite(id)
      return res.data
    } catch (err) {
      return deleteStoredFavorite(id)
    }
  },
}
