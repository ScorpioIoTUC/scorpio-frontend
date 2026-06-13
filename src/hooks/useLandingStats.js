import { useEffect, useState } from 'react'
import { getActiveStationsCount, getTotalPacketsCount } from '../services/statsService'

const REFRESH_INTERVAL_MS = 30000

export function useLandingStats() {
  const [activeStationsTotal, setActiveStationsTotal] = useState(null)
  const [totalPacketsReceived, setTotalPacketsReceived] = useState(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadStats({ showLoading = false } = {}) {
      if (showLoading) {
        setIsLoadingStats(true)
      }

      try {
        const [activeStations, packetsReceived] = await Promise.all([
          getActiveStationsCount(true),
          getTotalPacketsCount(),
        ])

        if (!isMounted) return

        setActiveStationsTotal(activeStations)
        setTotalPacketsReceived(packetsReceived)
        setStatsError('')
      } catch (error) {
        if (!isMounted) return

        setStatsError(error.message)
      } finally {
        if (isMounted && showLoading) {
          setIsLoadingStats(false)
        }
      }
    }

    loadStats({ showLoading: true })
    const intervalId = window.setInterval(() => {
      loadStats()
    }, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  return {
    activeStationsTotal,
    totalPacketsReceived,
    isLoadingStats,
    statsError,
  }
}
