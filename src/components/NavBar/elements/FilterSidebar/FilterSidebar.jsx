import { useMemo, useState } from 'react'
import './FilterSidebar.css'

function stationIdentifier(station) {
  return String(station?.uuid || station?.id)
}

function isStationOnline(station) {
  return station?.status === true || station?.status === 'online'
}

export const FilterSidebar = ({
  isOpen,
  onClose,
  stations = [],
  satellites = [],
  selectedStationIds = [],
  satelliteFilters = { displayName: '', noradId: '' },
  isSearchingSatellites = false,
  hasActiveSatelliteSearch = false,
  onSelectedStationIdsChange,
  onSatelliteFiltersChange,
}) => {
  const [stationSearchTerm, setStationSearchTerm] = useState('')
  const activeStations = useMemo(
    () =>
      stations
        .filter(isStationOnline)
        .filter((station) => (station.name || '').toLowerCase().includes(stationSearchTerm.trim().toLowerCase())),
    [stations, stationSearchTerm],
  )
  const selectedIds = new Set(selectedStationIds.map(String))

  function toggleStation(station) {
    const stationId = stationIdentifier(station)
    const nextIds = new Set(selectedIds)

    if (nextIds.has(stationId)) {
      nextIds.delete(stationId)
    } else {
      nextIds.add(stationId)
    }

    onSelectedStationIdsChange?.(Array.from(nextIds))
  }

  function updateSatelliteFilter(name, value) {
    onSatelliteFiltersChange?.({
      ...satelliteFilters,
      [name]: value,
    })
  }

  function clearFilters() {
    setStationSearchTerm('')
    onSelectedStationIdsChange?.([])
    onSatelliteFiltersChange?.({ displayName: '', noradId: '' })
  }

  return (
    <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="filter-header">
        <div>
          <p>Mission filters</p>
          <h2>Active stations</h2>
        </div>
        <button className="filter-close" type="button" onClick={onClose} aria-label="Cerrar filtros">
          x
        </button>
      </div>

      <div className="filter-content">
        <label className="filter-search">
          Buscar estacion activa
          <input
            type="search"
            value={stationSearchTerm}
            onChange={(event) => setStationSearchTerm(event.target.value)}
            placeholder="Nombre de estacion"
          />
        </label>

        <div className="filter-section">
          <div className="filter-title">
            <span>Ground stations</span>
            <strong>{selectedIds.size || 'All'}</strong>
          </div>

          <div className="checkbox-group">
            {activeStations.map((station) => {
              const stationId = stationIdentifier(station)

              return (
                <label className="checkbox-label" key={stationId}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(stationId)}
                    onChange={() => toggleStation(station)}
                  />
                  <span>{station.name || stationId}</span>
                </label>
              )
            })}

            {!activeStations.length && (
              <p className="filter-empty">No active stations match this filter.</p>
            )}
          </div>
        </div>

        <label className="filter-search">
          Buscar satelite por nombre
          <input
            type="search"
            value={satelliteFilters.displayName}
            onChange={(event) => updateSatelliteFilter('displayName', event.target.value)}
            placeholder="Display name"
          />
        </label>

        <label className="filter-search">
          Buscar satelite por NORAD
          <input
            type="search"
            inputMode="numeric"
            value={satelliteFilters.noradId}
            onChange={(event) => updateSatelliteFilter('noradId', event.target.value)}
            placeholder="NORAD ID"
          />
        </label>

        <div className="filter-section">
          <div className="filter-title">
            <span>Satellites</span>
            <strong>{hasActiveSatelliteSearch ? `${satellites.length} results` : 'Initial 100'}</strong>
          </div>

          <div className="checkbox-group checkbox-group--compact">
            {isSearchingSatellites && <p className="filter-empty">Searching satellites...</p>}

            {!isSearchingSatellites &&
              satellites.map((satellite) => (
                <div className="checkbox-label checkbox-label--readonly" key={satellite.noradId || satellite.id}>
                  <span>
                    {satellite.displayName || `NORAD ${satellite.noradId}`}
                    <small>NORAD {satellite.noradId || 'N/A'}</small>
                  </span>
                </div>
              ))}

            {!isSearchingSatellites && !satellites.length && (
              <p className="filter-empty">No satellites match this filter.</p>
            )}
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!selectedIds.size && !stationSearchTerm && !satelliteFilters.displayName && !satelliteFilters.noradId}
          >
            Clear
          </button>
          <button type="button" onClick={onClose}>
            Apply
          </button>
        </div>
      </div>
    </aside>
  )
}
