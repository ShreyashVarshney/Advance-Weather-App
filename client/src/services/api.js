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
    return getStoredHistory()
  },
  saveHistory: async (data) => {
    return saveStoredHistory(data)
  },
  deleteHistory: async (id) => {
    return deleteStoredHistory(id)
  },
  getFavorites: async () => {
    return getStoredFavorites()
  },
  saveFavorite: async (data) => {
    return saveStoredFavorite(data)
  },
  deleteFavorite: async (id) => {
    return deleteStoredFavorite(id)
  },
}
