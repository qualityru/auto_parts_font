const BASE = 'http://77.238.232.189:8015/api'

async function request(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {})
  const res = await fetch(`${BASE}${path}`, Object.assign({}, options, { headers }))

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Ошибка сервера: ${res.status}`)
  }

  return res
}

function normalizeLoginPayload(payload) {
  if (!payload) return {}

  // If payload is a plain string (email)
  if (typeof payload === 'string') {
    return { login: payload }
  }

  // If payload already has `login` key in expected shape, keep it
  if (payload.login) {
    // if supplied as { email: 'x' } handled below
    return payload
  }

  // If payload uses `email` key, map to `login`
  if (payload.email) {
    return Object.assign({}, payload, { login: payload.email })
  }

  return payload
}

export async function searchProducts(article) {
  const response = await fetch(`${BASE}/test/search?article=${encodeURIComponent(article)}`)

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`)
  }

  return await response.json()
}

export async function authorize(payload) {
  const body = normalizeLoginPayload(payload)
  const res = await request('/auth', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const token = res.headers.get('Authorization') || res.headers.get('authorization')
  const data = await res.json()
  return { data, token }
}

export async function confirmEmail(requestBody, code = undefined, recovery = false) {
  const params = []
  if (code !== undefined && code !== null) params.push(`code=${encodeURIComponent(code)}`)
  if (recovery) params.push(`recovery=true`)
  const query = params.length ? `?${params.join('&')}` : ''

  const body = normalizeLoginPayload(requestBody)
  const res = await request(`/auth/confirm_email${query}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  // endpoint may return json or just status
  try {
    return await res.json()
  } catch (e) {
    return null
  }
}

export async function createUser(guard_hash, requestBody) {
  const query = guard_hash ? `?guard_hash=${encodeURIComponent(guard_hash)}` : ''
  const body = normalizeLoginPayload(requestBody)
  const res = await request(`/auth/create_user${query}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const token = res.headers.get('Authorization') || res.headers.get('authorization')
  const data = await res.json()
  return { data, token }
}

export async function passwordRecovery(requestBody, guard_hash = undefined) {
  const query = guard_hash ? `?guard_hash=${encodeURIComponent(guard_hash)}` : ''
  const res = await request(`/auth/password_recovery${query}`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })

  try {
    return await res.json()
  } catch (e) {
    return null
  }
}