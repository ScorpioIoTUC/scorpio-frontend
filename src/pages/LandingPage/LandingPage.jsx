import { useMemo, useState } from 'react'
import GlobeView from '../../components/GlobeView/GlobeView'
import Navbar from '../../components/Navbar/Navbar'
import StationPanel from '../../components/StationPanel/StationPanel'
import StatusBar from '../../components/StatusBar/StatusBar'
import { useStations } from '../../hooks/useStations'
import './LandingPage.css'

export default function LandingPage() {
  const { stations, isLoading, error, isPreviewData } = useStations()
  const [selectedStation, setSelectedStation] = useState(null)

  const activeStations = useMemo(() => stations.filter((station) => station.status).length, [stations])
  const packetCount = useMemo(() => Math.max(12000, stations.length * 4200 + activeStations * 1800), [activeStations, stations])
  const telemetryMessage = useMemo(() => {
    const source = stations.find((station) => station.status) || stations[0]
    return source
      ? `New packet received from ${source.name}`
      : 'Awaiting station telemetry handshake'
  }, [stations])

  function handleStationSelect(station) {
    setSelectedStation(station)
  }

  function handleClosePanel() {
    setSelectedStation(null)
  }

  return (
    <main className="landing-page">
      <Navbar telemetryMessage={telemetryMessage} isPreviewData={isPreviewData} />
      <section className="landing-page__mission">
        <GlobeView
          stations={stations}
          selectedStation={selectedStation}
          onStationSelect={handleStationSelect}
          onResetView={handleClosePanel}
          isPanelOpen={Boolean(selectedStation)}
        />
        <StationPanel station={selectedStation} isOpen={Boolean(selectedStation)} onClose={handleClosePanel} />
      </section>
      <StatusBar activeStations={activeStations} packetCount={packetCount} isLoading={isLoading} error={error} />
    </main>
  )
}
