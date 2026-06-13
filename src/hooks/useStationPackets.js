import { useEffect, useState } from 'react'
import { getStationPackets } from '../services/packetService'

const REFRESH_INTERVAL_MS = 15000
const PACKET_LIMIT = 5

export function useStationPackets(station, isEnabled, page = 1) {
  const [stationPackets, setStationPackets] = useState([])
  const [packetPagination, setPacketPagination] = useState(null)
  const [isLoadingPackets, setIsLoadingPackets] = useState(false)
  const [packetError, setPacketError] = useState('')

  useEffect(() => {
    let isMounted = true
    let intervalId

    async function loadPackets({ showLoading = false } = {}) {
      if (!station || !isEnabled) return

      if (showLoading) {
        setIsLoadingPackets(true)
      }

      try {
        const { packets, pagination } = await getStationPackets(station, { limit: PACKET_LIMIT, page })
        if (!isMounted) return

        setStationPackets(packets)
        setPacketPagination(pagination)
        setPacketError('')
      } catch (error) {
        if (!isMounted) return

        setPacketError(error.message)
      } finally {
        if (isMounted && showLoading) {
          setIsLoadingPackets(false)
        }
      }
    }

    if (!station || !isEnabled) {
      return undefined
    }

    loadPackets({ showLoading: true })
    intervalId = window.setInterval(() => {
      loadPackets()
    }, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [station, isEnabled, page])

  return {
    stationPackets: station && isEnabled ? stationPackets : [],
    packetPagination: station && isEnabled ? packetPagination : null,
    isLoadingPackets: station && isEnabled ? isLoadingPackets : false,
    packetError: station && isEnabled ? packetError : '',
  }
}
