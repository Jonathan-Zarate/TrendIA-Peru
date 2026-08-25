import type { Session, SessionUser, TrendDetail, TrendPage } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

interface ApiErrorPayload { error?: { message?: string } }

export interface TrendFilters {
  query?: string
  originCountry?: string
  page?: number
  limit?: number
}

export async function listTrends(filters: TrendFilters, signal?: AbortSignal): Promise<TrendPage> {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.originCountry) params.set('originCountry', filters.originCountry)
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 6))
  return request<TrendPage>(`/api/trends?${params.toString()}`, signal)
}

export function getTrend(slug: string, signal?: AbortSignal): Promise<TrendDetail> {
  return request<TrendDetail>(`/api/trends/${encodeURIComponent(slug)}`, signal)
}

export function login(email: string, password: string): Promise<Session> {
  return request<Session>('/api/auth/login', undefined, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentUser(accessToken: string, signal?: AbortSignal): Promise<SessionUser> {
  const response = await request<{ user: SessionUser }>('/api/auth/me', signal, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return response.user
}

async function request<T>(path: string, signal?: AbortSignal, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
    ...(signal ? { signal } : {}),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as ApiErrorPayload | null
    throw new Error(payload?.error?.message ?? 'No pudimos consultar las tendencias.')
  }
  return response.json() as Promise<T>
}
