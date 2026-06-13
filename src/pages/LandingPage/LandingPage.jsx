import { useMemo, useState } from 'react'
import GlobeView from '../../components/GlobeView/GlobeView'
import Navbar from '../../components/Navbar/Navbar'
import PacketDetailPanel from '../../components/StationPanel/PacketDetailPanel'
import StationPanel from '../../components/StationPanel/StationPanel'
import StatusBar from '../../components/StatusBar/StatusBar'
import { useStationPackets } from '../../hooks/useStationPackets'
import { useStations } from '../../hooks/useStations'
import './LandingPage.css'

export default function LandingPage() {
  const { stations, isLoading, error, isPreviewData } = useStations()
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [packetPage, setPacketPage] = useState(1)
  const isSidebarOpen = Boolean(selectedStation)
  const { stationPackets, packetPagination, isLoadingPackets, packetError } = useStationPackets(
    selectedStation,
    isSidebarOpen,
    packetPage,
  )

  const activeStations = useMemo(
    () => stations.filter((station) => station.status === true || station.status === 'online').length,
    [stations],
  )
  const packetCount = useMemo(
    () => Math.max(stationPackets.length, stations.length * 4200 + activeStations * 1800),
    [activeStations, stationPackets.length, stations],
  )
  const telemetryMessage = useMemo(() => {
    const source = stations.find((station) => station.status === true || station.status === 'online') || stations[0]
    return source
      ? `New packet received from ${source.name}`
      : 'Awaiting station telemetry handshake'
  }, [stations])

  function handleStationSelect(station) {
    setSelectedPacket(null)
    setPacketPage(1)
    setSelectedStation(station)
  }

  function handleClosePanel() {
    setSelectedPacket(null)
    setPacketPage(1)
    setSelectedStation(null)
  }

  function handleBackToStation() {
    setSelectedPacket(null)
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
        />

        <StationPanel
          station={selectedStation}
          isOpen={isSidebarOpen && !selectedPacket}
          onClose={handleClosePanel}
          packets={stationPackets}
          packetPagination={packetPagination}
          packetPage={packetPage}
          onPacketPageChange={setPacketPage}
          isLoadingPackets={isLoadingPackets}
          packetError={packetError}
          onSelectPacket={setSelectedPacket}
        />

        <PacketDetailPanel
          station={selectedStation}
          packet={selectedPacket}
          isOpen={Boolean(selectedPacket)}
          onBack={handleBackToStation}
          onClose={handleClosePanel}
        />
      </section>
      <StatusBar activeStations={activeStations} packetCount={packetCount} isLoading={isLoading} error={error} />
    </main>
  )
}
