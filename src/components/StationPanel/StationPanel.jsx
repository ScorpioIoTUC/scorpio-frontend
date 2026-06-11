import './StationPanel.css'

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

function formatDate(value) {
  if (!value) return 'Unavailable'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unavailable'
  }

  return dateFormatter.format(date)
}

function formatCoordinate(value) {
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? coordinate.toFixed(4) : 'Unavailable'
}

function DetailRow({ label, value, tone }) {
  return (
    <div className="station-panel__row">
      <dt>{label}</dt>
      <dd className={tone ? `station-panel__value--${tone}` : undefined}>{value}</dd>
    </div>
  )
}

export default function StationPanel({ station, isOpen, onClose }) {
  const isOnline = Boolean(station?.status)

  return (
    <aside className={`station-panel ${isOpen ? 'station-panel--open' : ''}`} aria-hidden={!isOpen}>
      <div className="station-panel__header">
        <div>
          <p className="station-panel__eyebrow">Ground Station</p>
          <h2>{station?.name || 'Station information'}</h2>
        </div>
        <button className="station-panel__close" type="button" onClick={onClose} aria-label="Close station panel">
          x
        </button>
      </div>

      {station ? (
        <div className="station-panel__content">
          <section className="station-panel__section">
            <h3>Information</h3>
            <dl>
              <DetailRow label="Name" value={station.name} />
              <DetailRow label="Latitude" value={formatCoordinate(station.latitude)} />
              <DetailRow label="Longitude" value={formatCoordinate(station.longitude)} />
              <DetailRow label="Altitude" value={`${Number(station.altitude || 0).toLocaleString()} m`} />
              <DetailRow label="Status" value={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'online' : 'offline'} />
              <DetailRow label="Created" value={formatDate(station.createdAt)} />
              <DetailRow label="Last Seen" value={formatDate(station.lastSeen)} />
            </dl>
          </section>

          <section className="station-panel__section">
            <h3>Telemetry</h3>
            <div className="station-panel__telemetry-grid">
              <span>Packets</span>
              <strong>{station.status ? 'Nominal' : 'Standby'}</strong>
              <span>Link</span>
              <strong>{station.status ? 'Uplink ready' : 'No carrier'}</strong>
              <span>Mode</span>
              <strong>Telemetry</strong>
            </div>
          </section>
        </div>
      ) : (
        <p className="station-panel__empty">Select a ground station to inspect telemetry infrastructure.</p>
      )}
    </aside>
  )
}
