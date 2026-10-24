import axios from 'axios'

const api = axios.create({ baseURL: '/api/noaa' })

export const noaaApi = {
  /** List available CDO datasets */
  getDatasets: () => api.get('/datasets').then(r => r.data),

  /** Find nearest GHCND station for lat/lon */
  getStation: (lat, lon) => api.get('/station', { params: { lat, lon } }).then(r => r.data),

  /** Last N days of daily observations (TMAX, TMIN, PRCP, AWND, SNOW) */
  getDailyHistory: (lat, lon, days = 30) =>
    api.get('/history/daily', { params: { lat, lon, days } }).then(r => r.data),

  /** Monthly summaries for a given year */
  getMonthlyHistory: (lat, lon, year) =>
    api.get('/history/monthly', { params: { lat, lon, year } }).then(r => r.data),

  /** All-time temperature & precipitation records */
  getRecords: (lat, lon) => api.get('/records', { params: { lat, lon } }).then(r => r.data),

  /** 30-year climate normals */
  getNormals: (lat, lon) => api.get('/normals', { params: { lat, lon } }).then(r => r.data),

  /**
   * Generic CDO proxy — hit any CDO endpoint directly
   * e.g. noaaApi.proxy('datatypes', { datasetid: 'GHCND', limit: 10 })
   */
  proxy: (endpoint, params = {}) =>
    api.get(`/proxy/${endpoint}`, { params }).then(r => r.data),
}
