import { useEffect, useState } from 'react'
import { getStationMonthlyPackets } from '../services/statsService'

const REFRESH_INTERVAL_MS = 30000

export function useStationMonthlyPackets(station, isEnabled) {
  const [monthlyPacketStats, setMonthlyPacketStats] = useState(null)
  const [isLoadingMonthlyStats, setIsLoadingMonthlyStats] = useState(false)
  const [monthlyStatsError, setMonthlyStatsError] = useState('')
  const stationUuid = station?.uuid

  useEffect(() => {
    let isMounted = true
    let intervalId

    async function loadMonthlyStats({ showLoading = false } = {}) {
      if (!stationUuid || !isEnabled) return

      if (showLoading) {
        setIsLoadingMonthlyStats(true)
      }

      try {
        const stats = await getStationMonthlyPackets(stationUuid)

        if (!isMounted) return

        setMonthlyPacketStats(stats)
        setMonthlyStatsError('')
      } catch (error) {
        if (!isMounted) return

        setMonthlyStatsError(error.message)
      } finally {
        if (isMounted && showLoading) {
          setIsLoadingMonthlyStats(false)
        }
      }
    }

    if (!stationUuid || !isEnabled) {
      return undefined
    }

    loadMonthlyStats({ showLoading: true })
    intervalId = window.setInterval(() => {
      loadMonthlyStats()
    }, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [stationUuid, isEnabled])

  return {
    monthlyPacketStats: stationUuid && isEnabled ? monthlyPacketStats : null,
    isLoadingMonthlyStats: stationUuid && isEnabled ? isLoadingMonthlyStats : false,
    monthlyStatsError: stationUuid && isEnabled ? monthlyStatsError : '',
  }
}
