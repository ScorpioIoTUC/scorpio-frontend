import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { createStationMarkerElement } from '../StationMarker/StationMarker'
import './GlobeView.css'

const EARTH_TEXTURE = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
const EARTH_BUMP = '//unpkg.com/three-globe/example/img/earth-topology.png'
const SPACE_BACKGROUND = '//unpkg.com/three-globe/example/img/night-sky.png'
const DEFAULT_VIEW = { lat: -28, lng: -62, altitude: 1.9 }

export default function GlobeView({ stations, selectedStation, onStationSelect, onResetView, isPanelOpen }) {
  const globeRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

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
    const globe = globeRef.current
    if (!globe) return

    globe.pointOfView(DEFAULT_VIEW, 0)

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.28
    controls.enablePan = false
    controls.zoomSpeed = 0.45
    controls.minDistance = 230
    controls.maxDistance = 620
  }, [])

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
          altitude: 0.72,
        },
        1500,
      )
      return
    }

    globe.pointOfView(DEFAULT_VIEW, 1400)
    window.setTimeout(() => {
      if (!globeRef.current) return
      globeRef.current.controls().autoRotate = true
    }, 1450)
  }, [selectedStation])

  function handleGlobeReady() {
    const globe = globeRef.current
    if (!globe) return

    globe.renderer().setClearColor('#020617', 1)
    globe.pointOfView(DEFAULT_VIEW, 0)
  }

  return (
    <section className="globe-view" ref={containerRef} aria-label="Interactive SCORPIO ground station globe">
      <div className="globe-view__hud globe-view__hud--left" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="globe-view__hud globe-view__hud--right" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={EARTH_TEXTURE}
          bumpImageUrl={EARTH_BUMP}
          backgroundImageUrl={SPACE_BACKGROUND}
          showAtmosphere
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.18}
          htmlElementsData={stationMarkers}
          htmlLat="latitude"
          htmlLng="longitude"
          htmlAltitude={0.018}
          htmlTransitionDuration={260}
          htmlElement={(station) =>
            createStationMarkerElement(station, selectedStation?.id === station.id, onStationSelect)
          }
          onGlobeReady={handleGlobeReady}
        />
      )}

      <button className="globe-view__reset" type="button" onClick={onResetView} disabled={!isPanelOpen}>
        Reset View
      </button>
    </section>
  )
}
