import type { Session, SessionUser, TrendCategory, TrendDetail, TrendPage, TrendSummary } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

interface ApiErrorPayload { error?: { message?: string } }

export interface TrendFilters {
  query?: string
  originCountry?: string
  page?: number
  limit?: number
}

export interface ManagedTrendFilters extends TrendFilters {
  status?: string
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

export function listManagedTrends(accessToken: string, filters: ManagedTrendFilters, signal?: AbortSignal): Promise<TrendPage> {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.status) params.set('status', filters.status)
  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))
  return request<TrendPage>(`/api/trends/manage?${params.toString()}`, signal, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function listCategories(signal?: AbortSignal): Promise<TrendCategory[]> {
  const response = await request<{ data: TrendCategory[] }>('/api/trends/categories', signal)
  return response.data
}

export interface DraftInput {
  categoryId: string
  title: string
  summary: string
  originCountry: string
  originRegion?: string
  observationStartedAt?: string
  observationEndedAt?: string
}

export function createTrend(accessToken: string, input: DraftInput): Promise<TrendSummary> {
  return authorizedPost('/api/trends', accessToken, input)
}

export interface SourceInput {
  type: string
  title: string
  url: string
  publisher?: string
  publishedAt?: string
  consultedAt: string
  evidenceNote: string
}

export function addTrendSource(accessToken: string, trendId: string, input: SourceInput) {
  return authorizedPost(`/api/trends/${trendId}/sources`, accessToken, input)
}

export function submitTrendForReview(accessToken: string, trendId: string) {
  return authorizedPost<{ status: string }>(`/api/trends/${trendId}/submit-review`, accessToken)
}

export function publishTrend(accessToken: string, trendId: string) {
  return authorizedPost<{ status: string }>(`/api/trends/${trendId}/publish`, accessToken)
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

function authorizedPost<T = unknown>(path: string, accessToken: string, body?: object): Promise<T> {
  return request<T>(path, undefined, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}
