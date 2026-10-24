import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { weatherApi, searchApi } from '../services/api'
import toast from 'react-hot-toast'

export function useWeather() {
  const queryClient = useQueryClient()
  const [location, setLocation] = useState({ city: null, lat: null, lon: null })
  const [unit, setUnit] = useState('C')

  const currentQuery = useQuery({
    queryKey: ['weather', 'current', location],
    queryFn: () => {
      if (location.lat && location.lon) {
        return weatherApi.getCurrent({ lat: location.lat, lon: location.lon })
      }
      if (location.city) {
        return weatherApi.getCurrent({ city: location.city })
      }
      return weatherApi.getCurrent({ city: 'New York' })
    },
    onSuccess: (data) => {
      if (data.mock) toast('📍 Using demo data — add your API key to get live weather!', { icon: 'ℹ️', duration: 4000 })
    },
    staleTime: 5 * 60 * 1000,
  })

  const forecastQuery = useQuery({
    queryKey: ['weather', 'forecast', currentQuery.data?.lat, currentQuery.data?.lon],
    queryFn: () => weatherApi.getForecast({ lat: currentQuery.data.lat, lon: currentQuery.data.lon }),
    enabled: !!currentQuery.data?.lat,
    staleTime: 5 * 60 * 1000,
  })

  const aqiQuery = useQuery({
    queryKey: ['weather', 'aqi', currentQuery.data?.lat, currentQuery.data?.lon],
    queryFn: () => weatherApi.getAQI({ lat: currentQuery.data.lat, lon: currentQuery.data.lon }),
    enabled: !!currentQuery.data?.lat,
    staleTime: 5 * 60 * 1000,
  })

  const historyQuery = useQuery({
    queryKey: ['search', 'history'],
    queryFn: searchApi.getHistory,
    staleTime: 60 * 1000,
  })

  const favoritesQuery = useQuery({
    queryKey: ['search', 'favorites'],
    queryFn: searchApi.getFavorites,
    staleTime: 60 * 1000,
  })

  const saveHistoryMutation = useMutation({
    mutationFn: searchApi.saveHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['search', 'history'] }),
  })

  const saveFavoriteMutation = useMutation({
    mutationFn: searchApi.saveFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'favorites'] })
      toast.success('⭐ Added to favorites!')
    },
  })

  const deleteFavoriteMutation = useMutation({
    mutationFn: searchApi.deleteFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'favorites'] })
      toast.success('Removed from favorites')
    },
  })

  const deleteHistoryMutation = useMutation({
    mutationFn: searchApi.deleteHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['search', 'history'] }),
  })

  const searchCity = useCallback((city) => {
    setLocation({ city, lat: null, lon: null })
    saveHistoryMutation.mutate({ city })
  }, [])

  const searchByCoords = useCallback((lat, lon) => {
    setLocation({ city: null, lat, lon })
  }, [])

  const addFavorite = useCallback(() => {
    if (!currentQuery.data) return
    const { city, country, lat, lon } = currentQuery.data
    saveFavoriteMutation.mutate({ city, country, lat, lon })
  }, [currentQuery.data])

  const toggleUnit = useCallback(() => {
    setUnit(u => u === 'C' ? 'F' : 'C')
  }, [])

  return {
    current: currentQuery.data,
    forecast: forecastQuery.data,
    aqi: aqiQuery.data,
    history: historyQuery.data || [],
    favorites: favoritesQuery.data || [],
    isLoading: currentQuery.isLoading,
    isError: currentQuery.isError,
    error: currentQuery.error,
    unit,
    location,
    searchCity,
    searchByCoords,
    addFavorite,
    toggleUnit,
    deleteFavorite: (id) => deleteFavoriteMutation.mutate(id),
    deleteHistory: (id) => deleteHistoryMutation.mutate(id),
  }
}
