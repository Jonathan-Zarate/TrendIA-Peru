export interface OpportunitySummary {
  totalScore: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface TrendSummary {
  id: string
  slug: string
  title: string
  summary: string
  originCountry: string
  originRegion: string | null
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
  category: { id: string, name: string, slug: string }
  opportunity: OpportunitySummary | null
  publishedAt: string | null
  createdAt: string
}

export interface TrendSource {
  id: string
  type: string
  title: string
  url: string
  publisher: string | null
  publishedAt: string | null
  consultedAt: string
  evidenceNote: string
}

export interface TrendDetail extends TrendSummary {
  observationStartedAt: string | null
  observationEndedAt: string | null
  sources: TrendSource[]
}

export interface TrendPage {
  data: TrendSummary[]
  meta: { page: number, limit: number, total: number, totalPages: number }
}

export type UserRole = 'ADMIN' | 'ANALYST' | 'ENTREPRENEUR'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Session {
  accessToken: string
  user: SessionUser
}
