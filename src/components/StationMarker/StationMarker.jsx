import './StationMarker.css'

function isStationOnline(station) {
  return station?.status === true || station?.status === 'online'
}

export function createStationMarkerElement(station, isSelected, onSelect) {
  const marker = document.createElement('button')
  const isOnline = isStationOnline(station)

  marker.type = 'button'
  marker.className = [
    'station-marker',
    isOnline ? 'station-marker--online' : 'station-marker--offline',
    isSelected ? 'station-marker--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  marker.setAttribute(
    'aria-label',
    `${station.name || station.uuid || station.id} ground station`
  )

  marker.innerHTML = `
    <span class="station-marker__dot" aria-hidden="true"></span>

    <span class="station-marker__tooltip">
      <strong>${station.name || station.uuid || station.id}</strong>
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
