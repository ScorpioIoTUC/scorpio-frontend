import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import { createStationMarkerElement } from '../StationMarker/StationMarker'
import { createDayNightMaterial, createFallbackGlobeMaterial, sunPositionAt } from './dayNightMaterial'
import { calculateSatelliteOrbitPath } from '../../utils/orbitUtils'
import './GlobeView.css'

const SPACE_BACKGROUND = '//unpkg.com/three-globe/example/img/night-sky.png'
const DEFAULT_VIEW = { lat: -28, lng: -62, altitude: 1.9 }

export default function GlobeView({
  stations,
  satellites = [],
  selectedStation,
  selectedSatellite,
  selectedOrbitSatellite,
  onStationSelect,
  onSatelliteSelect,
  onResetView,
}) {
  const globeRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [globeMaterial, setGlobeMaterial] = useState(null)

  const stationMarkers = useMemo(
    () =>
      stations
        .filter((station) => Number.isFinite(Number(station.latitude)) && Number.isFinite(Number(station.longitude)))
        .map((station) => ({
          ...station,
          latitude: Number(station.latitude),
          longitude: Number(station.longitude),
        })),
    [stations],
  )
  const satelliteObjects = useMemo(
    () =>
      satellites
        .filter((satellite) => Number.isFinite(Number(satellite.latitude)) && Number.isFinite(Number(satellite.longitude)))
        .map((satellite) => ({
          ...satellite,
          latitude: Number(satellite.latitude),
          longitude: Number(satellite.longitude),
          globeAltitude: Number(satellite.globeAltitude) || 0.08,
        })),
    [satellites],
  )
  const selectedSatelliteId = selectedSatellite ? String(selectedSatellite.noradId || selectedSatellite.id) : ''
  const selectedOrbit = useMemo(() => {
    if (!selectedOrbitSatellite) return []

    const points = calculateSatelliteOrbitPath(selectedOrbitSatellite)
    return points.length ? [{ id: selectedSatelliteId, points }] : []
  }, [selectedOrbitSatellite, selectedSatelliteId])

  useEffect(() => {
    let isMounted = true

    createDayNightMaterial()
      .then((material) => {
        if (isMounted) {
          setGlobeMaterial(material)
        }
      })
      .catch(() => {
        if (isMounted) {
          setGlobeMaterial(createFallbackGlobeMaterial())
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return undefined

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setDimensions({ width: Math.round(width), height: Math.round(height) })
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!globeMaterial) return undefined
    if (!globeMaterial.uniforms?.sunPosition) return undefined

    function updateSunPosition() {
      globeMaterial.uniforms.sunPosition.value.set(...sunPositionAt(new Date()))
    }

    updateSunPosition()
    const intervalId = window.setInterval(updateSunPosition, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [globeMaterial])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    globe.pointOfView(DEFAULT_VIEW, 0)

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.22
    controls.enablePan = false
    controls.zoomSpeed = 0.42
    controls.minDistance = 230
    controls.maxDistance = 620
  }, [globeMaterial])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const controls = globe.controls()

    if (selectedStation) {
      controls.autoRotate = false
      globe.pointOfView(
        {
          lat: Number(selectedStation.latitude),
          lng: Number(selectedStation.longitude),
          altitude: 0.78,
        },
        1500,
      )
      return
    }

    if (selectedOrbitSatellite) {
      controls.autoRotate = false
      globe.pointOfView(
        {
          lat: Number(selectedOrbitSatellite.latitude),
          lng: Number(selectedOrbitSatellite.longitude),
          altitude: 1.25,
        },
        1500,
      )
      return
    }

    globe.pointOfView(DEFAULT_VIEW, 1400)
    const timeoutId = window.setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = true
      }
    }, 1450)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [selectedStation, selectedOrbitSatellite])

  function handleGlobeReady() {
    const globe = globeRef.current
    if (!globe) return

    globe.renderer().setClearColor('#020617', 1)
    globe.pointOfView(DEFAULT_VIEW, 0)
  }

  function handleZoom(pointOfView) {
    if (!globeMaterial) return

    globeMaterial.uniforms?.globeRotation?.value.set(pointOfView.lng, pointOfView.lat)
  }

  function resetView() {
    onResetView?.()
  }

  return (
    <section className="globe-view" ref={containerRef} aria-label="Interactive SCORPIO ground station globe">
      {dimensions.width > 0 && dimensions.height > 0 && globeMaterial && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeMaterial={globeMaterial}
          backgroundImageUrl={SPACE_BACKGROUND}
          showAtmosphere
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.15}
          htmlElementsData={stationMarkers}
          htmlLat="latitude"
          htmlLng="longitude"
          htmlAltitude={0.018}
          htmlTransitionDuration={180}
          htmlElement={(station) =>
            createStationMarkerElement(station, selectedStation?.id === station.id, onStationSelect)
          }
          objectsData={satelliteObjects}
          objectLat="latitude"
          objectLng="longitude"
          objectAltitude="globeAltitude"
          objectLabel={(satellite) => `
            <div class="satellite-tooltip">
              <strong>${satellite.displayName || `NORAD ${satellite.noradId}`}</strong>
              <span>NORAD: ${satellite.noradId || 'N/A'}</span>
              <span>Alt: ${Math.round(satellite.altitudeKm || 0).toLocaleString()} km</span>
            </div>
          `}
          objectThreeObject={(satellite) => {
            const satelliteId = String(satellite.noradId || satellite.id)
            const isSelected = satelliteId === selectedSatelliteId
            const geometry = new THREE.SphereGeometry(isSelected ? 1.35 : 1.05, 16, 16)
            const material = new THREE.MeshBasicMaterial({
              color: isSelected ? '#facc15' : '#22d3ee',
              transparent: true,
              opacity: 0.95,
            })

            return new THREE.Mesh(geometry, material)
          }}
          onObjectClick={(satellite) => onSatelliteSelect?.(satellite)}
          pathsData={selectedOrbit}
          pathPoints="points"
          pathPointLat="lat"
          pathPointLng="lng"
          pathPointAlt="alt"
          pathColor={() => '#facc15'}
          pathStroke={1.8}
          pathResolution={2}
          onGlobeReady={handleGlobeReady}
          onZoom={handleZoom}
        />
      )}

      {(selectedStation || selectedSatellite) && (
        <button className="globe-view__reset" type="button" onClick={resetView}>
          Global View
        </button>
      )}
    </section>
  )
}
