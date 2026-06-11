const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function getStations() {
  let response

  try {
    response = await fetch(`${API_URL}/stations`)
  } catch {
    throw new Error('Unable to reach SCORPIO station services.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error('Station service returned an invalid response.')
  }

  if (!response.ok) {
    const message = data?.message || data?.error
    throw new Error(message || 'Unable to load ground station data.')
  }

  if (!Array.isArray(data)) {
    throw new Error('Station service returned an unexpected payload.')
  }

  return data
}
