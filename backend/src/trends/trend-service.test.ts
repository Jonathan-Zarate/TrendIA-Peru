import { describe, expect, it, vi } from 'vitest'
import type { TrendRepository } from './ports.js'
import { TrendService } from './trend-service.js'

function createRepository(overrides: Partial<TrendRepository> = {}): TrendRepository {
  return {
    listActiveCategories: vi.fn(async () => []),
    findActiveScoringConfig: vi.fn(async () => ({ id: 'config-1', weights: { internationalGrowth: 20, localInterest: 25, competitiveAttractiveness: 15, investmentAccessibility: 10, implementationEase: 15, viralPotential: 15 } })),
    createEvaluation: vi.fn(async (input) => ({ id: 'evaluation-1', totalScore: input.totalScore, level: input.level })),
    list: vi.fn(async () => ({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } })),
    findPublishedBySlug: vi.fn(async () => null),
    findById: vi.fn(async () => ({ id: 'trend-1', status: 'DRAFT' as const })),
    activeCategoryExists: vi.fn(async () => true),
    createDraft: vi.fn(async (input) => ({
      id: 'trend-1',
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      originCountry: input.originCountry,
      originRegion: input.originRegion ?? null,
      status: 'DRAFT' as const,
      category: { id: input.categoryId, name: 'Tecnología', slug: 'tecnologia' },
      opportunity: null,
      publishedAt: null,
      createdAt: new Date('2026-08-25T00:00:00Z'),
    })),
    addSource: vi.fn(async (input) => ({
      id: 'source-1',
      type: input.type,
      title: input.title,
      url: input.url,
      publisher: input.publisher ?? null,
      publishedAt: input.publishedAt ?? null,
      consultedAt: input.consultedAt,
      evidenceNote: input.evidenceNote,
    })),
    hasActiveSource: vi.fn(async () => true),
    updateStatus: vi.fn(async () => true),
    ...overrides,
  }
}

describe('TrendService', () => {
  it('calcula la evaluación en servidor con la configuración activa', async () => {
    const repository = createRepository()
    const service = new TrendService(repository)
    const justifications = { internationalGrowth: 'Evidencia internacional.', localInterest: 'Evidencia de interés local.', competitiveAttractiveness: 'Evidencia de competencia.', investmentAccessibility: 'Evidencia de inversión.', implementationEase: 'Evidencia de implementación.', viralPotential: 'Evidencia de viralidad.' }

    const result = await service.evaluate({ trendId: 'trend-1', evaluatedBy: 'user-1', criteria: { internationalGrowth: 80, localInterest: 70, competitiveAttractiveness: 60, investmentAccessibility: 50, implementationEase: 70, viralPotential: 80 }, justifications })

    expect(result).toMatchObject({ totalScore: 70, level: 'HIGH' })
    expect(repository.createEvaluation).toHaveBeenCalledWith(expect.objectContaining({ scoringConfigId: 'config-1', totalScore: 70, level: 'HIGH', evaluatedBy: 'user-1' }))
  })

  it('fuerza el alcance público al listar tendencias', async () => {
    const repository = createRepository()
    const service = new TrendService(repository)

    await service.listPublic({
      query: '  inteligencia artificial  ',
      originCountry: 'kr',
      page: 2,
      limit: 10,
    })

    expect(repository.list).toHaveBeenCalledWith({
      query: 'inteligencia artificial',
      originCountry: 'KR',
      page: 2,
      limit: 10,
      publicOnly: true,
    })
  })

  it('genera slug normalizado y país en mayúsculas al crear un borrador', async () => {
    const repository = createRepository()
    const service = new TrendService(repository)

    const created = await service.createDraft({
      categoryId: 'category-1',
      title: '  Cabinas Fotográficas Coreanas  ',
      summary: 'Una experiencia compartible orientada al mercado peruano.',
      originCountry: 'kr',
      createdBy: 'analyst-1',
    })

    expect(created.slug).toBe('cabinas-fotograficas-coreanas')
    expect(repository.createDraft).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'cabinas-fotograficas-coreanas',
      originCountry: 'KR',
    }))
  })

  it('rechaza categorías inactivas y colisiones de slug', async () => {
    const noCategory = new TrendService(createRepository({
      activeCategoryExists: vi.fn(async () => false),
    }))
    const conflict = new TrendService(createRepository({
      createDraft: vi.fn(async () => null),
    }))
    const input = {
      categoryId: 'category-1',
      title: 'Nueva tendencia',
      summary: 'Resumen suficientemente largo para poder validar la tendencia.',
      originCountry: 'JP',
      createdBy: 'analyst-1',
    }

    await expect(noCategory.createDraft(input)).rejects.toMatchObject({ code: 'CATEGORY_NOT_FOUND' })
    await expect(conflict.createDraft(input)).rejects.toMatchObject({ code: 'TREND_SLUG_CONFLICT' })
  })

  it('no permite modificar fuentes de una tendencia ya publicada', async () => {
    const repository = createRepository({
      findById: vi.fn(async () => ({ id: 'trend-1', status: 'PUBLISHED' as const })),
    })
    const service = new TrendService(repository)

    await expect(service.addSource({
      trendId: 'trend-1',
      type: 'RESEARCH',
      title: 'Fuente primaria',
      url: 'https://example.com/research',
      consultedAt: '2026-08-25',
      evidenceNote: 'Evidencia suficiente para sustentar la tendencia.',
    })).rejects.toMatchObject({ code: 'TREND_NOT_EDITABLE' })
    expect(repository.addSource).not.toHaveBeenCalled()
  })

  it('exige fuente y transición de revisión antes de publicar', async () => {
    const withoutSource = new TrendService(createRepository({
      hasActiveSource: vi.fn(async () => false),
    }))
    await expect(withoutSource.submitForReview('trend-1')).rejects.toMatchObject({ code: 'SOURCE_REQUIRED' })

    const repository = createRepository({
      findById: vi.fn(async () => ({ id: 'trend-1', status: 'IN_REVIEW' as const })),
    })
    const service = new TrendService(repository)
    await service.publish('trend-1')
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'trend-1', 'IN_REVIEW', 'PUBLISHED', expect.any(Date),
    )
  })
})
