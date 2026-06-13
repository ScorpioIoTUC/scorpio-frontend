import './StationPanel.css'

function formatValue(value, suffix = '') {
  if (value === null || value === undefined || value === '') return 'N/A'
  return `${value}${suffix}`
}

function formatNumber(value, digits = 4, suffix = '') {
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toFixed(digits)}${suffix}` : 'N/A'
}

function formatDate(value) {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date.toLocaleString('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

function DetailRow({ label, value }) {
  return (
    <div className="station-panel__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default function SatellitePanel({ satellite, isOpen, onClose }) {
  return (
    <aside className={`station-panel satellite-panel ${isOpen ? 'station-panel--open' : ''}`} aria-hidden={!isOpen}>
      <div className="station-panel__header">
        <div>
          <p className="station-panel__eyebrow">SCORPIO Satellite</p>
          <h2>{satellite?.displayName || `NORAD ${satellite?.noradId || ''}`}</h2>
        </div>
        <button className="station-panel__close" type="button" onClick={onClose} aria-label="Close satellite panel">
          x
        </button>
      </div>

      {satellite ? (
        <div className="station-panel__content">
          <section className="station-panel__section">
            <h3>Identity</h3>
            <dl>
              <DetailRow label="Display name" value={formatValue(satellite.displayName)} />
              <DetailRow label="NORAD ID" value={formatValue(satellite.noradId)} />
              <DetailRow label="Object ID" value={formatValue(satellite.objectId)} />
              <DetailRow label="Epoch" value={formatDate(satellite.epoch)} />
            </dl>
          </section>

          <section className="station-panel__section">
            <h3>Live position</h3>
            <dl>
              <DetailRow label="Latitude" value={formatNumber(satellite.latitude)} />
              <DetailRow label="Longitude" value={formatNumber(satellite.longitude)} />
              <DetailRow label="Altitude" value={formatNumber(satellite.altitudeKm, 1, ' km')} />
            </dl>
          </section>

          <section className="station-panel__section">
            <h3>Orbital elements</h3>
            <dl>
              <DetailRow label="Mean motion" value={formatNumber(satellite.meanMotion, 8)} />
              <DetailRow label="Eccentricity" value={formatNumber(satellite.eccentricity, 8)} />
              <DetailRow label="Inclination" value={formatNumber(satellite.inclination, 4, ' deg')} />
              <DetailRow label="RAAN" value={formatNumber(satellite.raOfAscNode, 4, ' deg')} />
              <DetailRow label="Arg. pericenter" value={formatNumber(satellite.argOfPericenter, 4, ' deg')} />
              <DetailRow label="Mean anomaly" value={formatNumber(satellite.meanAnomaly, 4, ' deg')} />
              <DetailRow label="BSTAR" value={formatNumber(satellite.bstar, 8)} />
            </dl>
          </section>
        </div>
      ) : (
        <p className="station-panel__empty">Select a satellite to inspect orbital telemetry.</p>
      )}
    </aside>
  )
}
