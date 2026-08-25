import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import type { AuthService } from './auth-service.js'
import type { AuthModule } from './http.js'

function createAuthFixture(): AuthModule & {
  service: AuthService & {
    register: ReturnType<typeof vi.fn>
    login: ReturnType<typeof vi.fn>
    resolveAuthenticatedUser: ReturnType<typeof vi.fn>
  }
} {
  const service = {
    register: vi.fn(async () => ({
      accessToken: 'issued-token',
      user: {
        id: 'entrepreneur-1',
        name: 'Ana Torres',
        email: 'ana@example.com',
        role: 'ENTREPRENEUR' as const,
      },
    })),
    login: vi.fn(),
    resolveAuthenticatedUser: vi.fn(async () => ({
      id: 'analyst-1',
      name: 'Analista TrendIA',
      email: 'analyst@trendia.local',
      role: 'ANALYST' as const,
    })),
  } as unknown as AuthService & {
    register: ReturnType<typeof vi.fn>
    login: ReturnType<typeof vi.fn>
    resolveAuthenticatedUser: ReturnType<typeof vi.fn>
  }

  return {
    service,
    tokens: {
      issue: vi.fn(),
      verify: vi.fn(async (token: string) => {
        if (token !== 'valid-token') throw new Error('invalid token')
        return { userId: 'analyst-1' }
      }),
    },
  }
}

describe('HTTP auth', () => {
  it('registra emprendedores con una respuesta 201', async () => {
    const auth = createAuthFixture()
    const response = await createApp({ auth }).request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ana Torres',
        email: 'ana@example.com',
        password: 'una-clave-de-12-caracteres',
      }),
    })

    expect(response.status).toBe(201)
    expect(auth.service.register).toHaveBeenCalledWith({
      name: 'Ana Torres',
      email: 'ana@example.com',
      password: 'una-clave-de-12-caracteres',
    })
  })

  it('impide que el cliente envíe un rol durante el registro', async () => {
    const auth = createAuthFixture()
    const response = await createApp({ auth }).request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Atacante',
        email: 'attacker@example.com',
        password: 'una-clave-de-12-caracteres',
        role: 'ADMIN',
      }),
    })

    expect(response.status).toBe(400)
    expect(auth.service.register).not.toHaveBeenCalled()
  })

  it('rechaza JSON mal formado sin exponer detalles internos', async () => {
    const response = await createApp({ auth: createAuthFixture() }).request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{mal-json',
    })
    const body = await response.json() as { error: { code: string, requestId: string } }

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('INVALID_JSON')
    expect(body.error.requestId).toEqual(expect.any(String))
  })

  it('consulta al usuario actual y devuelve sus permisos vigentes', async () => {
    const auth = createAuthFixture()
    const response = await createApp({ auth }).request('/api/auth/me', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    const body = await response.json() as {
      user: { role: string }
      permissions: string[]
    }

    expect(response.status).toBe(200)
    expect(auth.service.resolveAuthenticatedUser).toHaveBeenCalledWith('analyst-1')
    expect(body.user.role).toBe('ANALYST')
    expect(body.permissions).toContain('trend:evaluate')
    expect(body.permissions).not.toContain('trend:publish')
  })

  it('rechaza cabeceras Bearer ausentes o ambiguas', async () => {
    const app = createApp({ auth: createAuthFixture() })

    for (const authorization of [undefined, 'Basic abc', 'Bearer uno dos']) {
      const requestInit = authorization
        ? { headers: { Authorization: authorization } }
        : {}
      const response = await app.request('/api/auth/me', requestInit)
      const body = await response.json() as { error: { code: string } }
      expect(response.status).toBe(401)
      expect(body.error.code).toBe('INVALID_TOKEN')
    }
  })
})
