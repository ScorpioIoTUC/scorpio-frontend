import { getAuthHeaders } from './sessionService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(endpoint, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      ...options,
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de usuarios.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'No se pudo completar la accion de usuario.')
  }

  return data
}

export async function getUserById(userId) {
  return request(`/users/${userId}`)
}

export async function updateUser(userId, payload) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(userId) {
  return request(`/users/${userId}`, {
    method: 'DELETE',
  })
}
