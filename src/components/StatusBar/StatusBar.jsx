import './StatusBar.css'

export default function StatusBar({ activeStations, packetCount, isLoading, error }) {
  return (
    <footer className="status-bar">
      <div>
        <span>Active stations:</span>
        <strong>{isLoading ? '...' : activeStations}</strong>
      </div>
      <div>
        <span>Received telemetry packets:</span>
        <strong>{packetCount.toLocaleString()}</strong>
      </div>
      {error && <p>{error} Using preview telemetry.</p>}
    </footer>
  )
}
