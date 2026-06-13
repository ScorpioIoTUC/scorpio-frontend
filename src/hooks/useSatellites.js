import { useEffect, useState } from 'react'
import { listSatellites } from '../services/satelliteService'

export function useSatellites() {
  const [satellites, setSatellites] = useState([])
  const [isLoadingSatellites, setIsLoadingSatellites] = useState(true)
  const [satelliteError, setSatelliteError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSatellites() {
      setIsLoadingSatellites(true)
      setSatelliteError('')

      try {
        const data = await listSatellites({ page: 1, limit: 100 })

        if (!isMounted) return

        setSatellites(data)
      } catch (error) {
        if (!isMounted) return

        setSatelliteError(error.message)
      } finally {
        if (isMounted) {
          setIsLoadingSatellites(false)
        }
      }
    }

    loadSatellites()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    satellites,
    isLoadingSatellites,
    satelliteError,
  }
}
