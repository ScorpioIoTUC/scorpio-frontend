import { useMemo, useState } from 'react'
import GlobeView from '../../components/GlobeView/GlobeView'
import Navbar from '../../components/Navbar/Navbar'
import PacketDetailPanel from '../../components/StationPanel/PacketDetailPanel'
import StationPanel from '../../components/StationPanel/StationPanel'
import StatusBar from '../../components/StatusBar/StatusBar'
import { useLandingStats } from '../../hooks/useLandingStats'
import { useStationMonthlyPackets } from '../../hooks/useStationMonthlyPackets'
import { useStationPackets } from '../../hooks/useStationPackets'
import { useStations } from '../../hooks/useStations'
import './LandingPage.css'

export default function LandingPage() {
  const { stations, isLoading, error, isPreviewData } = useStations()
  const { activeStationsTotal, totalPacketsReceived, isLoadingStats, statsError } = useLandingStats()
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [packetPage, setPacketPage] = useState(1)
  const [selectedStationFilterIds, setSelectedStationFilterIds] = useState([])
  const isSidebarOpen = Boolean(selectedStation)
  const { stationPackets, packetPagination, isLoadingPackets, packetError } = useStationPackets(
    selectedStation,
    isSidebarOpen,
    packetPage,
  )
  const { monthlyPacketStats, isLoadingMonthlyStats, monthlyStatsError } = useStationMonthlyPackets(
    selectedStation,
    isSidebarOpen,
  )

  const localActiveStations = useMemo(
    () => stations.filter((station) => station.status === true || station.status === 'online').length,
    [stations],
  )
  const filteredStations = useMemo(() => {
    if (!selectedStationFilterIds.length) return stations

    const selectedIds = new Set(selectedStationFilterIds.map(String))
    return stations.filter((station) => selectedIds.has(String(station.uuid || station.id)))
  }, [stations, selectedStationFilterIds])
  const activeStations = activeStationsTotal ?? localActiveStations
  const packetCount = totalPacketsReceived ?? packetPagination?.total ?? stationPackets.length
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

  function handleStationFilterChange(nextStationIds) {
    setSelectedStationFilterIds(nextStationIds)

    if (selectedStation && nextStationIds.length) {
      const selectedIds = new Set(nextStationIds.map(String))
      const stationId = String(selectedStation.uuid || selectedStation.id)

      if (!selectedIds.has(stationId)) {
        setSelectedPacket(null)
        setPacketPage(1)
        setSelectedStation(null)
      }
    }
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
      <Navbar
        telemetryMessage={telemetryMessage}
        isPreviewData={isPreviewData}
        stations={stations}
        selectedStationIds={selectedStationFilterIds}
        onSelectedStationIdsChange={handleStationFilterChange}
      />
      <section className="landing-page__mission">
        <GlobeView
          stations={filteredStations}
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
          monthlyPacketStats={monthlyPacketStats}
          isLoadingMonthlyStats={isLoadingMonthlyStats}
          monthlyStatsError={monthlyStatsError}
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
      <StatusBar
        activeStations={activeStations}
        packetCount={packetCount}
        isLoading={isLoading || isLoadingStats}
        error={statsError || error}
      />
    </main>
  )
}
