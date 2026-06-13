const TOKEN_KEY = 'scorpio_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getCurrentUserId() {
  const token = getToken()
  if (!token) return null

  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(paddedBase64))
    return payload.sub || payload.id || null
  } catch {
    return null
  }
}

export function getAuthHeaders() {
  const token = getToken()

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}
