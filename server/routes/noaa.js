const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour cache (historical data rarely changes)

const NOAA_BASE = 'https://www.ncei.noaa.gov/cdo-web/api/v2';
const TOKEN = process.env.NOAA_CDO_TOKEN;

// ─── Axios instance with NOAA auth header ─────────────────────────────────────
const noaa = axios.create({
  baseURL: NOAA_BASE,
  headers: { token: TOKEN },
  timeout: 12000,
});

const hasToken = () => TOKEN && TOKEN !== 'your_noaa_cdo_token_here';

// ─── Rich mock data for demo mode ─────────────────────────────────────────────
const MOCK_HISTORY_30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (30 - i));
  const base = 18 + Math.sin(i / 6) * 8;
  return {
    date: d.toISOString().split('T')[0],
    TMAX: +(base + 4 + Math.random() * 3).toFixed(1),
    TMIN: +(base - 3 - Math.random() * 3).toFixed(1),
    PRCP: +(Math.random() > 0.7 ? Math.random() * 15 : 0).toFixed(1),
    AWND: +(3 + Math.random() * 8).toFixed(1),
    SNOW: 0,
  };
});

const MOCK_MONTHLY = Array.from({ length: 12 }, (_, i) => {
  const monthBase = [6, 8, 12, 17, 22, 27, 30, 29, 25, 18, 12, 7][i];
  return {
    month: new Date(2025, i, 1).toLocaleString('en-US', { month: 'short' }),
    TMAX: +(monthBase + 3 + Math.random() * 2).toFixed(1),
    TMIN: +(monthBase - 5 - Math.random() * 2).toFixed(1),
    PRCP: +(20 + Math.random() * 60).toFixed(1),
  };
});

const MOCK_NORMALS = {
  jan: { TMAX: 9, TMIN: 2, PRCP: 55 },
  feb: { TMAX: 11, TMIN: 3, PRCP: 45 },
  mar: { TMAX: 15, TMIN: 6, PRCP: 40 },
  apr: { TMAX: 20, TMIN: 10, PRCP: 35 },
  may: { TMAX: 25, TMIN: 14, PRCP: 30 },
  jun: { TMAX: 30, TMIN: 19, PRCP: 25 },
  jul: { TMAX: 33, TMIN: 22, PRCP: 20 },
  aug: { TMAX: 32, TMIN: 21, PRCP: 28 },
  sep: { TMAX: 27, TMIN: 17, PRCP: 35 },
  oct: { TMAX: 21, TMIN: 11, PRCP: 50 },
  nov: { TMAX: 14, TMIN: 6, PRCP: 60 },
  dec: { TMAX: 10, TMIN: 3, PRCP: 58 },
};

// ─── Helper: find nearest GHCND station by lat/lon ────────────────────────────
async function findNearestStation(lat, lon) {
  const cacheKey = `station_${lat}_${lon}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const delta = 1.5;
  const extent = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;
  const res = await noaa.get('/stations', {
    params: { datasetid: 'GHCND', extent, limit: 10, sortfield: 'name' },
  });

  const stations = res.data.results || [];
  if (!stations.length) throw new Error('No NOAA stations found near this location');

  // Pick the station with the longest coverage
  const best = stations.sort((a, b) => {
    const aYears = new Date(a.maxdate) - new Date(a.mindate);
    const bYears = new Date(b.maxdate) - new Date(b.mindate);
    return bYears - aYears;
  })[0];

  cache.set(cacheKey, best);
  return best;
}

// ─── Helper: pivot NOAA flat data array → date-keyed object ──────────────────
function pivotData(results) {
  const byDate = {};
  results.forEach(({ date, datatype, value }) => {
    const d = date.split('T')[0];
    if (!byDate[d]) byDate[d] = { date: d };
    // Convert tenths-of-degrees (GHCND) → degrees Celsius
    if (['TMAX', 'TMIN', 'TAVG'].includes(datatype)) {
      byDate[d][datatype] = +(value / 10).toFixed(1);
    } else if (datatype === 'PRCP') {
      byDate[d][datatype] = +(value / 10).toFixed(1); // mm
    } else {
      byDate[d][datatype] = value;
    }
  });
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/noaa/datasets
 * Lists all available NOAA CDO datasets
 */
router.get('/datasets', async (req, res) => {
  try {
    if (!hasToken()) return res.json({ mock: true, results: [
      { id: 'GHCND', name: 'Daily Summaries', mindate: '1763-01-01', maxdate: new Date().toISOString().split('T')[0] },
      { id: 'GSOM', name: 'Global Summary of the Month', mindate: '1763-01-01', maxdate: new Date().toISOString().split('T')[0] },
      { id: 'GSOY', name: 'Global Summary of the Year', mindate: '1763-01-01', maxdate: new Date().toISOString().split('T')[0] },
      { id: 'NORMAL_DLY', name: 'Climate Normals Daily', mindate: '2010-01-01', maxdate: '2010-12-31' },
    ]});

    const cacheKey = 'noaa_datasets';
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));
    const result = await noaa.get('/datasets', { params: { limit: 25 } });
    cache.set(cacheKey, result.data);
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/noaa/station?lat=&lon=
 * Find the nearest GHCND station for a given lat/lon
 */
router.get('/station', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!hasToken()) {
      return res.json({
        mock: true,
        id: 'GHCND:USW00094728',
        name: 'NEW YORK CENTRAL PARK',
        latitude: 40.7789, longitude: -73.9692,
        elevation: 42.7,
        mindate: '1869-01-01',
        maxdate: new Date().toISOString().split('T')[0],
      });
    }
    const station = await findNearestStation(lat, lon);
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/noaa/history/daily?lat=&lon=&days=30
 * Last N days of daily climate observations (TMAX, TMIN, PRCP, AWND, SNOW)
 */
router.get('/history/daily', async (req, res) => {
  try {
    const { lat, lon, days = 30 } = req.query;
    const cacheKey = `daily_${lat}_${lon}_${days}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    if (!hasToken()) return res.json({ mock: true, data: MOCK_HISTORY_30 });

    const station = await findNearestStation(lat, lon);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - Number(days));

    const fmt = (d) => d.toISOString().split('T')[0];

    const result = await noaa.get('/data', {
      params: {
        datasetid: 'GHCND',
        stationid: station.id,
        datatypeid: 'TMAX,TMIN,PRCP,AWND,SNOW',
        startdate: fmt(startDate),
        enddate: fmt(endDate),
        units: 'metric',
        limit: 1000,
      },
    });

    const pivoted = pivotData(result.data.results || []);
    const payload = { station: station.name, stationId: station.id, data: pivoted };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('NOAA daily history error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/noaa/history/monthly?lat=&lon=&year=2024
 * Monthly summaries for a given year (GSOM dataset)
 */
router.get('/history/monthly', async (req, res) => {
  try {
    const { lat, lon, year = new Date().getFullYear() - 1 } = req.query;
    const cacheKey = `monthly_${lat}_${lon}_${year}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    if (!hasToken()) return res.json({ mock: true, data: MOCK_MONTHLY });

    const station = await findNearestStation(lat, lon);
    const result = await noaa.get('/data', {
      params: {
        datasetid: 'GSOM',
        stationid: station.id,
        datatypeid: 'TMAX,TMIN,PRCP',
        startdate: `${year}-01-01`,
        enddate: `${year}-12-31`,
        units: 'metric',
        limit: 100,
      },
    });

    const raw = pivotData(result.data.results || []);
    const monthly = raw.map((d) => ({
      ...d,
      month: new Date(d.date).toLocaleString('en-US', { month: 'short' }),
    }));

    const payload = { station: station.name, year, data: monthly };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('NOAA monthly history error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/noaa/records?lat=&lon=
 * All-time temperature records for the nearest station
 */
router.get('/records', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const cacheKey = `records_${lat}_${lon}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    if (!hasToken()) return res.json({
      mock: true,
      stationName: 'NEW YORK CENTRAL PARK',
      recordHigh: { value: 41.1, date: '1936-07-09' },
      recordLow: { value: -26.1, date: '1934-02-09' },
      recordRain: { value: 200.7, date: '1882-10-08' },
    });

    const station = await findNearestStation(lat, lon);
    // Fetch extreme yearly data
    const resHigh = await noaa.get('/data', {
      params: {
        datasetid: 'GHCND', stationid: station.id,
        datatypeid: 'TMAX', startdate: station.mindate,
        enddate: station.maxdate, limit: 1, sortfield: 'value', sortorder: 'desc',
      },
    });
    const resLow = await noaa.get('/data', {
      params: {
        datasetid: 'GHCND', stationid: station.id,
        datatypeid: 'TMIN', startdate: station.mindate,
        enddate: station.maxdate, limit: 1, sortfield: 'value', sortorder: 'asc',
      },
    });
    const resRain = await noaa.get('/data', {
      params: {
        datasetid: 'GHCND', stationid: station.id,
        datatypeid: 'PRCP', startdate: station.mindate,
        enddate: station.maxdate, limit: 1, sortfield: 'value', sortorder: 'desc',
      },
    });

    const high = resHigh.data.results?.[0];
    const low = resLow.data.results?.[0];
    const rain = resRain.data.results?.[0];

    const payload = {
      stationName: station.name,
      stationId: station.id,
      coverageStart: station.mindate,
      coverageEnd: station.maxdate,
      recordHigh: high ? { value: +(high.value / 10).toFixed(1), date: high.date?.split('T')[0] } : null,
      recordLow: low ? { value: +(low.value / 10).toFixed(1), date: low.date?.split('T')[0] } : null,
      recordRain: rain ? { value: +(rain.value / 10).toFixed(1), date: rain.date?.split('T')[0] } : null,
    };

    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('NOAA records error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/noaa/normals?lat=&lon=
 * 30-year climate normals for the nearest station
 */
router.get('/normals', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const cacheKey = `normals_${lat}_${lon}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    if (!hasToken()) return res.json({ mock: true, data: MOCK_NORMALS });

    const station = await findNearestStation(lat, lon);
    const result = await noaa.get('/data', {
      params: {
        datasetid: 'NORMAL_MLY',
        stationid: station.id,
        datatypeid: 'MLY-TMAX-NORMAL,MLY-TMIN-NORMAL,MLY-PRCP-NORMAL',
        startdate: '2010-01-01',
        enddate: '2010-12-01',
        limit: 100,
      },
    });

    const payload = { station: station.name, data: result.data.results || [] };
    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('NOAA normals error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/noaa/proxy/{endpoint}?{params}
 * Generic passthrough proxy for any CDO endpoint
 * e.g. /api/noaa/proxy/datatypes?datasetid=GHCND&limit=10
 */
router.get('/proxy/:endpoint(*)', async (req, res) => {
  try {
    if (!hasToken()) return res.status(503).json({ error: 'NOAA token required for proxy endpoint' });

    const result = await noaa.get(`/${req.params.endpoint}`, { params: req.query });
    res.json(result.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
