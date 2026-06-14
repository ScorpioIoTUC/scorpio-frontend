import { useEffect, useRef, useState } from 'react'
import { socket } from '../libs/socket'

const PACKET_HIGHLIGHT_MS = 2000

export function usePacketEvents() {
  const [highlightedStationUuids, setHighlightedStationUuids] = useState([])
  const [latestPacketEvent, setLatestPacketEvent] = useState(null)
  const highlightTimeoutsRef = useRef(new Map())

  useEffect(() => {
    const highlightTimeouts = highlightTimeoutsRef.current

    function removeHighlight(stationUuid) {
      setHighlightedStationUuids((current) => current.filter((uuid) => uuid !== stationUuid))
      highlightTimeouts.delete(stationUuid)
    }

    function highlightStation(stationUuid) {
      if (!stationUuid) return

      window.clearTimeout(highlightTimeouts.get(stationUuid))
      setHighlightedStationUuids((current) => (
        current.includes(stationUuid) ? current : [...current, stationUuid]
      ))

      const timeoutId = window.setTimeout(() => {
        removeHighlight(stationUuid)
      }, PACKET_HIGHLIGHT_MS)

      highlightTimeouts.set(stationUuid, timeoutId)
    }

    function handleConnect() {
      console.info('[socket] connected', socket.id)
    }

    function handleConnectError(error) {
      console.error('[socket] connect_error', error)
    }

    function handleAny(eventName, payload) {
      console.debug('[socket] event', eventName, payload)
    }

    function handlePacketCreated(packet) {
      console.info('[socket] packet:created', packet)
      setLatestPacketEvent(packet)
      highlightStation(packet?.stationUuid)
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('packet:created', handlePacketCreated)
    socket.onAny(handleAny)

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('packet:created', handlePacketCreated)
      socket.offAny(handleAny)

      highlightTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      highlightTimeouts.clear()

      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [])

  return {
    highlightedStationUuids,
    latestPacketEvent,
  }
}
