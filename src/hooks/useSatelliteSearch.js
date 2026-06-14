import { useEffect, useMemo, useState } from 'react'
import { listSatellites } from '../services/satelliteService'

const SEARCH_DEBOUNCE_MS = 400
const MAX_SEARCH_RESULTS = 500
const DEFAULT_PAGE_SIZE = 25

function normalizeFilters(filters) {
  return {
    displayName: filters.displayName.trim(),
    noradId: filters.noradId.trim(),
  }
}

function getTotalPages(total, pageSize) {
  return Math.max(1, Math.ceil(Math.min(total, MAX_SEARCH_RESULTS) / pageSize))
}

export function useSatelliteSearch(filters) {
  const normalizedFilters = useMemo(() => normalizeFilters(filters), [filters])
  const [debouncedFilters, setDebouncedFilters] = useState(normalizedFilters)
  const [satelliteSearchResults, setSatelliteSearchResults] = useState([])
  const [satelliteSearchPagination, setSatelliteSearchPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    maxResults: MAX_SEARCH_RESULTS,
  })
  const [satelliteSearchPage, setSatelliteSearchPage] = useState(1)
  const [satelliteSearchLimit, setSatelliteSearchLimit] = useState(DEFAULT_PAGE_SIZE)
  const [isSearchingSatellites, setIsSearchingSatellites] = useState(false)
  const [satelliteSearchError, setSatelliteSearchError] = useState('')
  const hasActiveSatelliteSearch = Boolean(debouncedFilters.displayName || debouncedFilters.noradId)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters(normalizedFilters)
      setSatelliteSearchPage(1)
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
        setSatelliteSearchPagination({
          page: 1,
          limit: satelliteSearchLimit,
          total: 0,
          totalPages: 1,
          maxResults: MAX_SEARCH_RESULTS,
        })
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
        const { satellites, pagination } = await listSatellites({
          page: satelliteSearchPage,
          limit: satelliteSearchLimit,
          displayName: debouncedFilters.displayName,
          noradId: debouncedFilters.noradId,
          signal: controller.signal,
        })

        if (!isMounted) return

        const total = Number(pagination.total || satellites.length)
        const totalPages = getTotalPages(total, satelliteSearchLimit)
        const safePage = Math.min(Number(pagination.page || satelliteSearchPage), totalPages)

        setSatelliteSearchResults(satellites)
        setSatelliteSearchPagination({
          page: safePage,
          limit: satelliteSearchLimit,
          total,
          totalPages,
          maxResults: MAX_SEARCH_RESULTS,
        })
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
  }, [debouncedFilters, hasActiveSatelliteSearch, satelliteSearchLimit, satelliteSearchPage])

  function updateSatelliteSearchPage(nextPage) {
    setSatelliteSearchPage((currentPage) => {
      const totalPages = satelliteSearchPagination.totalPages || 1
      const page = typeof nextPage === 'function' ? nextPage(currentPage) : nextPage
      return Math.min(Math.max(Number(page) || 1, 1), totalPages)
    })
  }

  function updateSatelliteSearchLimit(nextLimit) {
    setSatelliteSearchLimit(Number(nextLimit))
    setSatelliteSearchPage(1)
  }

  return {
    satelliteSearchResults,
    satelliteSearchPagination,
    satelliteSearchPage,
    satelliteSearchLimit,
    isSearchingSatellites,
    satelliteSearchError,
    hasActiveSatelliteSearch,
    setSatelliteSearchPage: updateSatelliteSearchPage,
    setSatelliteSearchLimit: updateSatelliteSearchLimit,
  }
}
