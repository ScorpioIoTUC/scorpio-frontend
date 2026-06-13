import { useEffect, useMemo, useState } from 'react'
import { calculateSatellitePosition, createSatelliteRecord } from '../utils/orbitUtils'

const POSITION_REFRESH_MS = 1000

function satelliteIdentifier(satellite) {
  return String(satellite?.noradId || satellite?.id)
}

function buildPositionedSatellites(records) {
  const now = new Date()

  return records
    .map(({ satellite, satrec }) => {
      const position = calculateSatellitePosition(satrec, now)
      if (!position) return null

      return {
        ...satellite,
        satelliteId: satelliteIdentifier(satellite),
        latitude: position.latitude,
        longitude: position.longitude,
        altitudeKm: position.altitudeKm,
        globeAltitude: position.globeAltitude,
      }
    })
    .filter(Boolean)
}

export function useLiveSatellitePositions(satellites) {
  const records = useMemo(
    () =>
      satellites
        .map((satellite) => ({
          satellite,
          satrec: createSatelliteRecord(satellite),
        }))
        .filter((record) => Boolean(record.satrec)),
    [satellites],
  )
  const [liveSatellites, setLiveSatellites] = useState(() => buildPositionedSatellites(records))

  useEffect(() => {
    if (!records.length) {
      const timeoutId = window.setTimeout(() => {
        setLiveSatellites([])
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    function updatePositions() {
      setLiveSatellites(buildPositionedSatellites(records))
    }

    const timeoutId = window.setTimeout(updatePositions, 0)
    const intervalId = window.setInterval(updatePositions, POSITION_REFRESH_MS)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [records])

  return liveSatellites
}
