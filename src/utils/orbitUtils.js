import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  json2satrec,
  propagate,
} from 'satellite.js'

const EARTH_RADIUS_KM = 6371

export function mapSatelliteToOmm(satellite) {
  return {
    OBJECT_NAME: satellite.displayName || `NORAD ${satellite.noradId}`,
    OBJECT_ID: satellite.objectId || '',
    EPOCH: satellite.epoch,
    MEAN_MOTION: satellite.meanMotion,
    ECCENTRICITY: satellite.eccentricity,
    INCLINATION: satellite.inclination,
    RA_OF_ASC_NODE: satellite.raOfAscNode,
    ARG_OF_PERICENTER: satellite.argOfPericenter,
    MEAN_ANOMALY: satellite.meanAnomaly,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: satellite.noradId,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 0,
    BSTAR: satellite.bstar,
    MEAN_MOTION_DOT: satellite.meanMotionDot,
    MEAN_MOTION_DDOT: satellite.meanMotionDdot,
  }
}

export function createSatelliteRecord(satellite) {
  if (!satellite?.epoch || !satellite?.noradId) return null

  try {
    return json2satrec(mapSatelliteToOmm(satellite))
  } catch {
    return null
  }
}

export function calculateSatellitePosition(satrec, date = new Date()) {
  if (!satrec) return null

  const positionAndVelocity = propagate(satrec, date)
  const positionEci = positionAndVelocity?.position

  if (!positionEci) return null

  const geodetic = eciToGeodetic(positionEci, gstime(date))
  const altitudeKm = Number(geodetic.height)

  if (!Number.isFinite(altitudeKm)) return null

  return {
    latitude: degreesLat(geodetic.latitude),
    longitude: degreesLong(geodetic.longitude),
    altitudeKm,
    globeAltitude: Math.max(0.035, altitudeKm / EARTH_RADIUS_KM),
  }
}

export function calculateSatelliteOrbitPath(satellite, { samples = 96 } = {}) {
  const satrec = createSatelliteRecord(satellite)
  const meanMotion = Number(satellite?.meanMotion)

  if (!satrec || !Number.isFinite(meanMotion) || meanMotion <= 0) {
    return []
  }

  const periodMinutes = 1440 / meanMotion
  const startMs = Date.now() - (periodMinutes * 60 * 1000) / 2
  const stepMs = (periodMinutes * 60 * 1000) / Math.max(samples - 1, 1)

  return Array.from({ length: samples }, (_, index) => {
    const position = calculateSatellitePosition(satrec, new Date(startMs + stepMs * index))
    if (!position) return null

    return {
      lat: position.latitude,
      lng: position.longitude,
      alt: position.globeAltitude,
    }
  }).filter(Boolean)
}
