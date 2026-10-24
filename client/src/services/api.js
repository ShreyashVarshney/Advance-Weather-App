import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const weatherApi = {
  getCurrent: (params) => api.get('/weather/current', { params }).then(r => r.data),
  getForecast: (params) => api.get('/weather/forecast', { params }).then(r => r.data),
  getAQI: (params) => api.get('/weather/aqi', { params }).then(r => r.data),
  getAutocomplete: (q) => api.get('/weather/autocomplete', { params: { q } }).then(r => r.data),
  reverseGeocode: (lat, lon) => api.get('/weather/reverse', { params: { lat, lon } }).then(r => r.data),
}

export const searchApi = {
  getHistory: () => api.get('/search/history').then(r => r.data),
  saveHistory: (data) => api.post('/search/history', data).then(r => r.data),
  deleteHistory: (id) => api.delete(`/search/history/${id}`).then(r => r.data),
  getFavorites: () => api.get('/search/favorites').then(r => r.data),
  saveFavorite: (data) => api.post('/search/favorites', data).then(r => r.data),
  deleteFavorite: (id) => api.delete(`/search/favorites/${id}`).then(r => r.data),
}
