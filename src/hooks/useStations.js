import { useEffect, useState } from 'react'
import { getStations } from '../services/stationService'

const previewStations = [
  {
    id: 2,
    uuid: 'preview-scorpio-s01',
    name: 'SCORPIO-S01',
    latitude: -33.21736144880188,
    longitude: -70.7752609209486,
    altitude: 502,
    status: true,
    createdAt: '2026-06-09T23:47:53.752Z',
    lastSeen: '2026-06-09T23:47:53.752Z',
  },
  {
    id: 3,
    uuid: 'preview-scorpio-s02',
    name: 'SCORPIO-S02',
    latitude: -12.046374,
    longitude: -77.042793,
    altitude: 161,
    status: true,
    createdAt: '2026-06-08T16:22:00.000Z',
    lastSeen: '2026-06-10T18:12:00.000Z',
  },
  {
    id: 4,
    uuid: 'preview-scorpio-s03',
    name: 'SCORPIO-S03',
    latitude: -34.603722,
    longitude: -58.381592,
    altitude: 25,
    status: false,
    createdAt: '2026-05-24T14:19:15.000Z',
    lastSeen: '2026-06-01T08:40:00.000Z',
  },
]

export function useStations() {
  const [stations, setStations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPreviewData, setIsPreviewData] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadStations() {
      setIsLoading(true)
      setError('')

      try {
        const stationData = await getStations()
        if (!isMounted) return
        setStations(stationData)
        setIsPreviewData(false)
      } catch (requestError) {
        if (!isMounted) return

        setError(requestError.message)
        setStations(previewStations)
        setIsPreviewData(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStations()

    return () => {
      isMounted = false
    }
  }, [])

  return { stations, isLoading, error, isPreviewData }
}
