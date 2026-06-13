import { useEffect, useMemo, useState } from 'react'
import { listSatellites } from '../services/satelliteService'

const SEARCH_DEBOUNCE_MS = 400
const SEARCH_LIMIT = 100

function normalizeFilters(filters) {
  return {
    displayName: filters.displayName.trim(),
    noradId: filters.noradId.trim(),
  }
}

export function useSatelliteSearch(filters) {
  const normalizedFilters = useMemo(() => normalizeFilters(filters), [filters])
  const [debouncedFilters, setDebouncedFilters] = useState(normalizedFilters)
  const [satelliteSearchResults, setSatelliteSearchResults] = useState([])
  const [isSearchingSatellites, setIsSearchingSatellites] = useState(false)
  const [satelliteSearchError, setSatelliteSearchError] = useState('')
  const hasActiveSatelliteSearch = Boolean(debouncedFilters.displayName || debouncedFilters.noradId)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters(normalizedFilters)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [normalizedFilters])

  useEffect(() => {
    if (!hasActiveSatelliteSearch) {
      const timeoutId = window.setTimeout(() => {
        setSatelliteSearchResults([])
        setSatelliteSearchError('')
        setIsSearchingSatellites(false)
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    const controller = new AbortController()
    let isMounted = true

    async function searchSatellites() {
      setIsSearchingSatellites(true)
      setSatelliteSearchError('')

      try {
        const results = await listSatellites({
          page: 1,
          limit: SEARCH_LIMIT,
          displayName: debouncedFilters.displayName,
          noradId: debouncedFilters.noradId,
          signal: controller.signal,
        })

        if (!isMounted) return

        setSatelliteSearchResults(results)
      } catch (error) {
        if (!isMounted || controller.signal.aborted) return

        setSatelliteSearchError(error.message)
      } finally {
        if (isMounted && !controller.signal.aborted) {
          setIsSearchingSatellites(false)
        }
      }
    }

    searchSatellites()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [debouncedFilters, hasActiveSatelliteSearch])

  return {
    satelliteSearchResults,
    isSearchingSatellites,
    satelliteSearchError,
    hasActiveSatelliteSearch,
  }
}
