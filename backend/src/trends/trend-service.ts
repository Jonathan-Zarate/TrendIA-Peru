import { TrendError } from './errors.js'
import type { Page, SourceType, TrendCategory, TrendDetail, TrendListItem, TrendSource, TrendStatus } from './model.js'
import type { TrendRepository } from './ports.js'

export interface ListTrendInput {
  query?: string
  category?: string
  originCountry?: string
  status?: TrendStatus
  page: number
  limit: number
}

export interface CreateDraftInput {
  categoryId: string
  title: string
  summary: string
  originCountry: string
  originRegion?: string
  observationStartedAt?: string
  observationEndedAt?: string
  createdBy: string
}

export interface AddSourceInput {
  trendId: string
  type: SourceType
  title: string
  url: string
  publisher?: string
  publishedAt?: string
  consultedAt: string
  evidenceNote: string
}

export class TrendService {
  constructor(private readonly trends: TrendRepository) {}

  async listCategories(): Promise<TrendCategory[]> {
    return await this.trends.listActiveCategories()
  }

  async listPublic(input: ListTrendInput): Promise<Page<TrendListItem>> {
    return await this.trends.list({ ...cleanFilters(input), publicOnly: true })
  }

  async listInternal(input: ListTrendInput): Promise<Page<TrendListItem>> {
    return await this.trends.list({ ...cleanFilters(input), publicOnly: false })
  }

  async getPublished(slug: string): Promise<TrendDetail> {
    const trend = await this.trends.findPublishedBySlug(slug)
    if (!trend) throw new TrendError('TREND_NOT_FOUND', 'La tendencia no existe.', 404)
    return trend
  }

  async createDraft(input: CreateDraftInput): Promise<TrendListItem> {
    if (!await this.trends.activeCategoryExists(input.categoryId)) {
      throw new TrendError('CATEGORY_NOT_FOUND', 'La categoría no existe o está inactiva.', 404)
    }

    const created = await this.trends.createDraft({
      ...input,
      title: input.title.trim(),
      summary: input.summary.trim(),
      originCountry: input.originCountry.toUpperCase(),
      ...(input.originRegion ? { originRegion: input.originRegion.trim() } : {}),
      slug: slugify(input.title),
    })

    if (!created) {
      throw new TrendError('TREND_SLUG_CONFLICT', 'Ya existe una tendencia con ese título.', 409)
    }
    return created
  }

  async addSource(input: AddSourceInput): Promise<TrendSource> {
    const trend = await this.trends.findById(input.trendId)
    if (!trend) throw new TrendError('TREND_NOT_FOUND', 'La tendencia no existe.', 404)
    if (trend.status !== 'DRAFT' && trend.status !== 'IN_REVIEW') {
      throw new TrendError('TREND_NOT_EDITABLE', 'Solo se agregan fuentes durante investigación o revisión.', 409)
    }

    const source = await this.trends.addSource({
      ...input,
      title: input.title.trim(),
      evidenceNote: input.evidenceNote.trim(),
      ...(input.publisher ? { publisher: input.publisher.trim() } : {}),
    })
    if (!source) throw new TrendError('SOURCE_CONFLICT', 'La fuente ya está registrada en esta tendencia.', 409)
    return source
  }

  async submitForReview(id: string): Promise<void> {
    const trend = await this.trends.findById(id)
    if (!trend) throw new TrendError('TREND_NOT_FOUND', 'La tendencia no existe.', 404)
    if (trend.status !== 'DRAFT') {
      throw new TrendError('INVALID_STATUS_TRANSITION', 'Solo un borrador puede enviarse a revisión.', 409)
    }
    if (!await this.trends.hasActiveSource(id)) {
      throw new TrendError('SOURCE_REQUIRED', 'Registra al menos una fuente antes de enviar a revisión.', 409)
    }
    if (!await this.trends.updateStatus(id, 'DRAFT', 'IN_REVIEW')) {
      throw new TrendError('INVALID_STATUS_TRANSITION', 'El estado cambió durante la operación.', 409)
    }
  }

  async publish(id: string): Promise<void> {
    const trend = await this.trends.findById(id)
    if (!trend) throw new TrendError('TREND_NOT_FOUND', 'La tendencia no existe.', 404)
    if (trend.status !== 'IN_REVIEW') {
      throw new TrendError('INVALID_STATUS_TRANSITION', 'Solo una tendencia revisada puede publicarse.', 409)
    }
    if (!await this.trends.hasActiveSource(id)) {
      throw new TrendError('SOURCE_REQUIRED', 'La publicación requiere al menos una fuente activa.', 409)
    }
    if (!await this.trends.updateStatus(id, 'IN_REVIEW', 'PUBLISHED', new Date())) {
      throw new TrendError('INVALID_STATUS_TRANSITION', 'El estado cambió durante la operación.', 409)
    }
  }
}

function cleanFilters(input: ListTrendInput) {
  return {
    page: input.page,
    limit: input.limit,
    ...(input.query?.trim() ? { query: input.query.trim() } : {}),
    ...(input.category?.trim() ? { category: input.category.trim() } : {}),
    ...(input.originCountry?.trim() ? { originCountry: input.originCountry.trim().toUpperCase() } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
