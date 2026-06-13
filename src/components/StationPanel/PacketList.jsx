function formatPacketDate(value) {
  if (!value) return 'No timestamp'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'No timestamp'
  }

  return date.toLocaleString('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

function PacketRow({ packet, onSelectPacket }) {
  return (
    <article className="packet-list__item">
      <div className="packet-list__item-header">
        <strong>{packet.satelliteDisplayName || `NORAD ${packet.satelliteNoradId || 'Unknown'}`}</strong>
        <span>{formatPacketDate(packet.createdAt)}</span>
      </div>
      <dl>
        <div>
          <dt>RSSI</dt>
          <dd>{packet.rssi ?? 'N/A'} dBm</dd>
        </div>
        <div>
          <dt>SNR</dt>
          <dd>{packet.snr ?? 'N/A'} dB</dd>
        </div>
        <div>
          <dt>CRC</dt>
          <dd className={packet.crc ? 'packet-list__ok' : 'packet-list__error'}>{packet.crc ? 'OK' : 'Error'}</dd>
        </div>
      </dl>
      <button className="packet-list__detail-button" type="button" onClick={() => onSelectPacket(packet)}>
        More details
      </button>
    </article>
  )
}

export default function PacketList({ packets, isLoading, error, onSelectPacket }) {
  if (isLoading) {
    return <p className="station-panel__state">Loading recent packets...</p>
  }

  if (error) {
    return <p className="station-panel__state station-panel__state--error">{error}</p>
  }

  if (!packets.length) {
    return <p className="station-panel__state">No packets received yet</p>
  }

  return (
    <div className="packet-list">
      {packets.map((packet) => (
        <PacketRow
          key={packet.id || `${packet.stationUuid}-${packet.createdAt}`}
          packet={packet}
          onSelectPacket={onSelectPacket}
        />
      ))}
    </div>
  )
}
