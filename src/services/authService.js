const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(endpoint, options) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach SCORPIO authentication services. Check your network connection.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const serverMessage = data?.message || data?.error

    if (response.status === 401 || response.status === 403) {
      throw new Error(serverMessage || 'Invalid email or password.')
    }

    if (response.status >= 500) {
      throw new Error(serverMessage || 'SCORPIO authentication services are temporarily unavailable.')
    }

    throw new Error(serverMessage || 'The authentication request could not be completed.')
  }

  return data
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!data?.success || !data?.token) {
    throw new Error(data?.message || 'Login failed. Please verify your credentials.')
  }

  return data
}

export async function signup(name, email, password) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  if (!data?.id) {
    throw new Error('Sign up completed without a valid account response. Please try again.')
  }

  return data
}
