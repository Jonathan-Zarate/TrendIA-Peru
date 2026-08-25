export const TREND_STATUSES = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'] as const
export const SOURCE_TYPES = ['OPEN_DATA', 'SEARCH_TRENDS', 'ARTICLE', 'RESEARCH', 'SURVEY', 'OTHER'] as const

export type TrendStatus = typeof TREND_STATUSES[number]
export type SourceType = typeof SOURCE_TYPES[number]

export interface TrendCategory {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface OpportunityEvaluationSummary {
  id: string
  totalScore: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface TrendListItem {
  id: string
  slug: string
  title: string
  summary: string
  originCountry: string
  originRegion: string | null
  status: TrendStatus
  category: { id: string, name: string, slug: string }
  opportunity: { totalScore: number, level: 'LOW' | 'MEDIUM' | 'HIGH' } | null
  publishedAt: Date | null
  createdAt: Date
}

export interface TrendSource {
  id: string
  type: SourceType
  title: string
  url: string
  publisher: string | null
  publishedAt: string | null
  consultedAt: string
  evidenceNote: string
}

export interface TrendDetail extends TrendListItem {
  observationStartedAt: string | null
  observationEndedAt: string | null
  sources: TrendSource[]
}

export interface Page<T> {
  data: T[]
  meta: { page: number, limit: number, total: number, totalPages: number }
}
