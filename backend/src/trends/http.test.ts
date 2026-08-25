import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import type { AuthService } from '../auth/auth-service.js'
import type { AuthModule } from '../auth/http.js'
import type { UserRole } from '../auth/model.js'
import type { TrendService } from './trend-service.js'

function dependencies(role: UserRole = 'ANALYST') {
  const auth: AuthModule = {
    tokens: {
      issue: vi.fn(),
      verify: vi.fn(async () => ({ userId: 'user-1' })),
    },
    service: {
      resolveAuthenticatedUser: vi.fn(async () => ({
        id: 'user-1', name: role, email: `${role.toLowerCase()}@trendia.demo`, role,
      })),
    } as unknown as AuthService,
  }
  const service = {
    listCategories: vi.fn(async () => [{ id: 'category-1', name: 'Tecnología', slug: 'tecnologia', description: null }]),
    listPublic: vi.fn(async () => ({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } })),
    listInternal: vi.fn(async () => ({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } })),
    getPublished: vi.fn(),
    createDraft: vi.fn(async (input) => ({ id: 'trend-1', ...input, status: 'DRAFT' })),
    addSource: vi.fn(),
    evaluate: vi.fn(async () => ({ id: 'evaluation-1', totalScore: 70, level: 'HIGH' })),
    submitForReview: vi.fn(),
    publish: vi.fn(),
  } as unknown as TrendService & Record<string, ReturnType<typeof vi.fn>>

  return { auth, trends: { service } }
}

const validDraft = {
  categoryId: '5f6e2b50-b7c0-4b85-b107-9eeac74cbf37',
  title: 'Cabinas fotográficas coreanas',
  summary: 'Experiencia cultural y comercial adaptable al mercado peruano.',
  originCountry: 'KR',
}

describe('HTTP trends', () => {
  it('expone las categorías activas sin acoplar el frontend a IDs de Neon', async () => {
    const deps = dependencies()
    const response = await createApp(deps).request('/api/trends/categories')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [{ id: 'category-1', name: 'Tecnología', slug: 'tecnologia', description: null }] })
  })

  it('lista el catálogo público sin token y valida la paginación', async () => {
    const deps = dependencies()
    const app = createApp(deps)

    const response = await app.request('/api/trends?q=ia&page=1&limit=20')
    expect(response.status).toBe(200)
    expect(deps.trends.service.listPublic).toHaveBeenCalledWith({
      query: 'ia', page: 1, limit: 20,
    })

    const invalid = await app.request('/api/trends?limit=500')
    expect(invalid.status).toBe(400)
  })

  it('no expone la vista interna sin autenticación', async () => {
    const response = await createApp(dependencies()).request('/api/trends/manage')
    expect(response.status).toBe(401)
  })

  it('impide crear borradores al ENTREPRENEUR', async () => {
    const deps = dependencies('ENTREPRENEUR')
    const response = await createApp(deps).request('/api/trends', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', 'Content-Type': 'application/json' },
      body: JSON.stringify(validDraft),
    })

    expect(response.status).toBe(403)
    expect(deps.trends.service.createDraft).not.toHaveBeenCalled()
  })

  it('permite al ANALYST crear un borrador con su identidad del servidor', async () => {
    const deps = dependencies('ANALYST')
    const response = await createApp(deps).request('/api/trends', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', 'Content-Type': 'application/json' },
      body: JSON.stringify(validDraft),
    })

    expect(response.status).toBe(201)
    expect(deps.trends.service.createDraft).toHaveBeenCalledWith({
      ...validDraft,
      createdBy: 'user-1',
    })
  })

  it('reserva la publicación para ADMIN', async () => {
    const analyst = dependencies('ANALYST')
    const denied = await createApp(analyst).request(
      '/api/trends/5f6e2b50-b7c0-4b85-b107-9eeac74cbf37/publish',
      { method: 'POST', headers: { Authorization: 'Bearer valid' } },
    )
    expect(denied.status).toBe(403)
    expect(analyst.trends.service.publish).not.toHaveBeenCalled()

    const admin = dependencies('ADMIN')
    const allowed = await createApp(admin).request(
      '/api/trends/5f6e2b50-b7c0-4b85-b107-9eeac74cbf37/publish',
      { method: 'POST', headers: { Authorization: 'Bearer valid' } },
    )
    expect(allowed.status).toBe(200)
    expect(admin.trends.service.publish).toHaveBeenCalledWith('5f6e2b50-b7c0-4b85-b107-9eeac74cbf37')
  })

  it('permite evaluar al ANALYST y toma su identidad del servidor', async () => {
    const deps = dependencies('ANALYST')
    const criterion = { score: 70, justification: 'La evidencia respalda este criterio.' }
    const response = await createApp(deps).request('/api/trends/5f6e2b50-b7c0-4b85-b107-9eeac74cbf37/evaluations', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', 'Content-Type': 'application/json' },
      body: JSON.stringify({ internationalGrowth: criterion, localInterest: criterion, competitiveAttractiveness: criterion, investmentAccessibility: criterion, implementationEase: criterion, viralPotential: criterion }),
    })

    expect(response.status).toBe(201)
    expect(deps.trends.service.evaluate).toHaveBeenCalledWith(expect.objectContaining({ trendId: '5f6e2b50-b7c0-4b85-b107-9eeac74cbf37', evaluatedBy: 'user-1' }))
  })
})
