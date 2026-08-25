import type { Page, SourceType, TrendDetail, TrendListItem, TrendSource, TrendStatus } from './model.js'

export interface TrendFilters {
  query?: string
  category?: string
  originCountry?: string
  status?: TrendStatus
  page: number
  limit: number
  publicOnly: boolean
}

export interface CreateDraftRecord {
  categoryId: string
  title: string
  slug: string
  summary: string
  originCountry: string
  originRegion?: string
  observationStartedAt?: string
  observationEndedAt?: string
  createdBy: string
}

export interface CreateSourceRecord {
  trendId: string
  type: SourceType
  title: string
  url: string
  publisher?: string
  publishedAt?: string
  consultedAt: string
  evidenceNote: string
}

export interface TrendRepository {
  list(filters: TrendFilters): Promise<Page<TrendListItem>>
  findPublishedBySlug(slug: string): Promise<TrendDetail | null>
  findById(id: string): Promise<{ id: string, status: TrendStatus } | null>
  activeCategoryExists(id: string): Promise<boolean>
  createDraft(input: CreateDraftRecord): Promise<TrendListItem | null>
  addSource(input: CreateSourceRecord): Promise<TrendSource | null>
  hasActiveSource(id: string): Promise<boolean>
  updateStatus(id: string, from: TrendStatus, to: TrendStatus, publishedAt?: Date): Promise<boolean>
}
