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
  selectedStationIds = [],
  onSelectedStationIdsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const activeStations = useMemo(
    () =>
      stations
        .filter(isStationOnline)
        .filter((station) => (station.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase())),
    [stations, searchTerm],
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

  function clearFilters() {
    setSearchTerm('')
    onSelectedStationIdsChange?.([])
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
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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

        <div className="filter-actions">
          <button type="button" onClick={clearFilters} disabled={!selectedIds.size && !searchTerm}>
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
