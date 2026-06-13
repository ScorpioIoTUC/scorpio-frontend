import './StationPanel.css'

function formatValue(value, suffix = '') {
  if (value === null || value === undefined || value === '') return 'N/A'
  return `${value}${suffix}`
}

function formatPacketDate(value) {
  if (!value) return 'No timestamp'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No timestamp'

  return date.toLocaleString('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

function decodePayload(rawPayload) {
  if (!rawPayload) return 'No payload'

  if (Array.isArray(rawPayload)) {
    return rawPayload
      .map((code) => String.fromCharCode(Number(code)))
      .join('')
      .replace(/[^\x20-\x7E]/g, '.')
  }

  if (typeof rawPayload === 'string') {
    try {
      return atob(rawPayload)
    } catch {
      return rawPayload
    }
  }

  return JSON.stringify(rawPayload)
}

function DetailRow({ label, value }) {
  return (
    <div className="station-panel__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default function PacketDetailPanel({ station, packet, isOpen, onBack, onClose }) {
  return (
    <aside className={`station-panel packet-detail-panel ${isOpen ? 'station-panel--open' : ''}`} aria-hidden={!isOpen}>
      <div className="station-panel__header">
        <button className="station-panel__back" type="button" onClick={onBack} aria-label="Volver a la estacion">
          ←
        </button>
        <div>
          <p className="station-panel__eyebrow">Packet detail</p>
          <h2>{packet?.satelliteDisplayName || `Packet ${packet?.id || ''}`}</h2>
        </div>
        <button className="station-panel__close" type="button" onClick={onClose} aria-label="Cerrar detalle de paquete">
          x
        </button>
      </div>

      {packet ? (
        <div className="station-panel__content">
          <section className="station-panel__section">
            <h3>Packet</h3>
            <dl>
              <DetailRow label="Timestamp" value={formatPacketDate(packet.createdAt)} />
              <DetailRow label="Station" value={station.name} />
              <DetailRow label="CRC" value={packet.crc ? 'OK' : 'Error'} />
            </dl>
          </section>

          <section className="station-panel__section">
            <h3>Satellite</h3>
            <dl>
              <DetailRow label="Satellite" value={formatValue(packet.satelliteDisplayName)} />
              <DetailRow label="NORAD" value={formatValue(packet.satelliteNoradId)} />
              <DetailRow label="Latitude" value={formatValue(packet.satelliteLatitude)} />
              <DetailRow label="Longitude" value={formatValue(packet.satelliteLongitude)} />
              <DetailRow label="Altitude" value={formatValue(packet.satelliteAltitude, ' km')} />
              <DetailRow label="Slant distance" value={formatValue(packet.slantDistance, ' km')} />
              <DetailRow label="Elevation" value={formatValue(packet.angleElevation, '°')} />
            </dl>
          </section>

          <section className="station-panel__section">
            <h3>Radio link</h3>
            <dl>
              <DetailRow label="RSSI" value={formatValue(packet.rssi, ' dBm')} />
              <DetailRow label="SNR" value={formatValue(packet.snr, ' dB')} />
              <DetailRow label="Frequency error" value={formatValue(packet.frequencyError, ' Hz')} />
            </dl>
          </section>

          <section className="station-panel__section">
            <h3>Payload</h3>
            <dl>
              <DetailRow label="Decoded" value={decodePayload(packet.rawPayload)} />
              <DetailRow label="Raw bytes" value={Array.isArray(packet.rawPayload) ? packet.rawPayload.join(', ') : 'N/A'} />
            </dl>
          </section>
        </div>
      ) : (
        <p className="station-panel__empty">Selecciona un paquete para ver su detalle.</p>
      )}
    </aside>
  )
}
