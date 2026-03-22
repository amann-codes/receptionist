import { DEMO_USER } from './data'

// ─── Backend URL — set via VITE_API_URL env var, no user-facing input ──────────
export const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'

const TOKEN_KEY = 'receptionist_token'

export function getToken()        { return localStorage.getItem(TOKEN_KEY) }
export function setToken(t)       { localStorage.setItem(TOKEN_KEY, t) }
export function clearToken()      { localStorage.removeItem(TOKEN_KEY) }

// ─── Demo user check (bypass all network) ─────────────────────────────────────
export function isDemoCredentials(username, password) {
  return username === DEMO_USER.username && password === DEMO_USER.password
}

// ─── Auth headers ─────────────────────────────────────────────────────────────
function authHeaders() {
  const t = getToken()
  return t
    ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

// ─── Core fetch ────────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  })
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent('receptionist:unauthorized'))
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
    signal:  AbortSignal.timeout(6000),
  })
  if (res.status === 401) throw new Error('Invalid credentials')
  if (!res.ok)            throw new Error('Login failed')
  const data = await res.json()
  setToken(data.access_token)
  return data
}

export async function verifyToken() {
  return apiFetch('/auth/me', { signal: AbortSignal.timeout(4000) })
}

// ─── Calls ────────────────────────────────────────────────────────────────────
export async function fetchStats()  { return apiFetch('/api/stats', { signal: AbortSignal.timeout(4000) }) }

export async function fetchCalls({ intent, status, search, page = 1, limit = 100 } = {}) {
  const p = new URLSearchParams()
  if (intent && intent !== 'all') p.set('intent', intent)
  if (status)  p.set('status',  status)
  if (search)  p.set('search',  search)
  p.set('page',  page)
  p.set('limit', limit)
  return apiFetch(`/api/calls?${p}`)
}

export async function patchStatus(callId, status) {
  return apiFetch(`/api/calls/${callId}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  })
}

export async function patchNotes(callId, notes) {
  return apiFetch(`/api/calls/${callId}/notes`, {
    method: 'PATCH', body: JSON.stringify({ notes }),
  })
}

export async function deleteCall(callId) {
  return apiFetch(`/api/calls/${callId}`, { method: 'DELETE' })
}

// ─── Agent config ─────────────────────────────────────────────────────────────
export async function fetchAgentConfig()       { return apiFetch('/api/agent') }
export async function saveAgentConfig(config)  {
  return apiFetch('/api/agent', { method: 'PUT', body: JSON.stringify(config) })
}
