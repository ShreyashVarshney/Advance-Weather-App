import axios from 'axios'
import {
  getMockStation,
  getMockDaily,
  getMockMonthly,
  getMockRecords,
} from './mockFallback'

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/noaa` 
  : '/api/noaa'
const api = axios.create({ baseURL: API_BASE, timeout: 6000 })

export const noaaApi = {
  getDatasets: async () => {
    try {
      const res = await api.get('/datasets')
      return res.data
    } catch {
      return { results: [] }
    }
  },

  getStation: async (lat, lon) => {
    try {
      const res = await api.get('/station', { params: { lat, lon } })
      return res.data
    } catch {
      return getMockStation()
    }
  },

  getDailyHistory: async (lat, lon, days = 30) => {
    try {
      const res = await api.get('/history/daily', { params: { lat, lon, days } })
      return res.data
    } catch {
      return getMockDaily()
    }
  },

  getMonthlyHistory: async (lat, lon, year) => {
    try {
      const res = await api.get('/history/monthly', { params: { lat, lon, year } })
      return res.data
    } catch {
      return getMockMonthly()
    }
  },

  getRecords: async (lat, lon) => {
    try {
      const res = await api.get('/records', { params: { lat, lon } })
      return res.data
    } catch {
      return getMockRecords()
    }
  },

  getNormals: async (lat, lon) => {
    try {
      const res = await api.get('/normals', { params: { lat, lon } })
      return res.data
    } catch {
      return { mock: true, data: [] }
    }
  },

  proxy: async (endpoint, params = {}) => {
    try {
      const res = await api.get(`/proxy/${endpoint}`, { params })
      return res.data
    } catch {
      return { results: [] }
    }
  },
}
