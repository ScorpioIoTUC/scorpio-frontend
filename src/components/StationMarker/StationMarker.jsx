import './StationMarker.css'

export function createStationMarkerElement(station, isSelected, onSelect) {
  const marker = document.createElement('button')
  const isOnline = Boolean(station.status)

  marker.type = 'button'
  marker.className = [
    'station-marker',
    isOnline ? 'station-marker--online' : 'station-marker--offline',
    isSelected ? 'station-marker--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
  marker.setAttribute('aria-label', `${station.name} ground station`)

  marker.innerHTML = `
    <span class="station-marker__pulse"></span>
    <span class="station-marker__core"></span>
    <span class="station-marker__mast"></span>
    <span class="station-marker__dish"></span>
    <span class="station-marker__tooltip">
      <strong>${station.name}</strong>
      <span>Lat: ${Number(station.latitude).toFixed(2)}</span>
      <span>Lon: ${Number(station.longitude).toFixed(2)}</span>
    </span>
  `

  marker.addEventListener('click', (event) => {
    event.stopPropagation()
    onSelect(station)
  })

  return marker
}
