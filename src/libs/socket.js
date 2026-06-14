import { io } from 'socket.io-client'

export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

if (SOCKET_URL.includes('5173')) {
  console.warn('[socket] VITE_API_URL appears to point to the frontend. Expected backend URL, e.g. http://localhost:3000.')
}

console.info('[socket] connecting to', SOCKET_URL)

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
})
