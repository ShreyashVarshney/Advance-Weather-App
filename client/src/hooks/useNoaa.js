import { useQuery } from '@tanstack/react-query'
import { noaaApi } from '../services/noaaApi'

/**
 * useNoaa(lat, lon)
 * Returns all NOAA CDO data for a given location:
 *  - station metadata
 *  - 30-day daily history
 *  - monthly history for last full year
 *  - all-time records
 */
export function useNoaa(lat, lon) {
  const enabled = !!(lat && lon)

  const station = useQuery({
    queryKey: ['noaa', 'station', lat, lon],
    queryFn: () => noaaApi.getStation(lat, lon),
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24h — stations don't move
  })

  const daily = useQuery({
    queryKey: ['noaa', 'daily', lat, lon],
    queryFn: () => noaaApi.getDailyHistory(lat, lon, 30),
    enabled,
    staleTime: 60 * 60 * 1000,
  })

  const monthly = useQuery({
    queryKey: ['noaa', 'monthly', lat, lon],
    queryFn: () => noaaApi.getMonthlyHistory(lat, lon),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  })

  const records = useQuery({
    queryKey: ['noaa', 'records', lat, lon],
    queryFn: () => noaaApi.getRecords(lat, lon),
    enabled,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  return {
    station: station.data,
    daily: daily.data,
    monthly: monthly.data,
    records: records.data,
    isLoading: station.isLoading || daily.isLoading,
    isError: station.isError || daily.isError,
    isMock: daily.data?.mock,
  }
}
