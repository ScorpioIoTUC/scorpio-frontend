import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { createStationMarkerElement } from '../StationMarker/StationMarker'
import { createDayNightMaterial, createFallbackGlobeMaterial, sunPositionAt } from './dayNightMaterial'
import './GlobeView.css'

const SPACE_BACKGROUND = '//unpkg.com/three-globe/example/img/night-sky.png'
const DEFAULT_VIEW = { lat: -28, lng: -62, altitude: 1.9 }

export default function GlobeView({ stations, selectedStation, onStationSelect, onResetView }) {
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

    globe.pointOfView(DEFAULT_VIEW, 1400)
    const timeoutId = window.setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = true
      }
    }, 1450)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [selectedStation])

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
          onGlobeReady={handleGlobeReady}
          onZoom={handleZoom}
        />
      )}

      {selectedStation && (
        <button className="globe-view__reset" type="button" onClick={resetView}>
          Global View
        </button>
      )}
    </section>
  )
}
