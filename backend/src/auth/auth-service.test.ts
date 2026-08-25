import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { AuthService } from './auth-service.js'
import { AuthError } from './errors.js'
import type { AuthUser } from './model.js'
import type { AccessTokenService, CreateUserInput, PasswordHasher, UserRepository } from './ports.js'

class MemoryUserRepository implements UserRepository {
  readonly users: AuthUser[] = []

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.email === email) ?? null
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.id === id) ?? null
  }

  async create(input: CreateUserInput): Promise<AuthUser> {
    const user: AuthUser = {
      id: randomUUID(),
      ...input,
      isActive: true,
      failedLoginAttempts: 0,
      lockedAt: null,
    }
    this.users.push(user)
    return user
  }

  async recordFailedLogin(id: string, maximumAttempts: number, occurredAt: Date): Promise<void> {
    const user = this.users.find((candidate) => candidate.id === id)
    if (!user) return
    user.failedLoginAttempts += 1
    if (user.failedLoginAttempts >= maximumAttempts) user.lockedAt = occurredAt
  }

  async resetFailedLogins(id: string): Promise<void> {
    const user = this.users.find((candidate) => candidate.id === id)
    if (!user) return
    user.failedLoginAttempts = 0
    user.lockedAt = null
  }
}

const passwords: PasswordHasher = {
  hash: async (password) => `hash:${password}`,
  verify: async (password, hash) => hash === `hash:${password}`,
}

const tokens: AccessTokenService = {
  issue: async (userId) => `token:${userId}`,
  verify: async (token) => ({ userId: token.replace('token:', '') }),
}

function createFixture(now = new Date('2026-08-24T20:00:00.000Z')) {
  const users = new MemoryUserRepository()
  const service = new AuthService({ users, passwords, tokens, now: () => now })
  return { service, users }
}

describe('AuthService', () => {
  it('normaliza el correo y fuerza el rol ENTREPRENEUR en el registro público', async () => {
    const { service, users } = createFixture()

    const result = await service.register({
      name: '  Ana Torres  ',
      email: ' ANA@EXAMPLE.COM ',
      password: 'una-clave-segura',
    })

    expect(result.user).toMatchObject({
      name: 'Ana Torres',
      email: 'ana@example.com',
      role: 'ENTREPRENEUR',
    })
    expect(users.users[0]?.passwordHash).toBe('hash:una-clave-segura')
    expect(result.accessToken).toBe(`token:${result.user.id}`)
  })

  it('rechaza correos duplicados después de normalizarlos', async () => {
    const { service } = createFixture()
    await service.register({ name: 'Ana', email: 'ana@example.com', password: 'clave-segura' })

    await expect(service.register({
      name: 'Otra Ana',
      email: 'ANA@EXAMPLE.COM',
      password: 'otra-clave',
    })).rejects.toMatchObject({ code: 'EMAIL_ALREADY_REGISTERED', status: 409 })
  })

  it('reinicia los intentos fallidos después de un login válido', async () => {
    const { service, users } = createFixture()
    await service.register({ name: 'Ana', email: 'ana@example.com', password: 'correcta' })

    await expect(service.login({
      email: 'ana@example.com',
      password: 'incorrecta',
    })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    expect(users.users[0]?.failedLoginAttempts).toBe(1)

    await service.login({ email: 'ana@example.com', password: 'correcta' })
    expect(users.users[0]?.failedLoginAttempts).toBe(0)
  })

  it('bloquea temporalmente la cuenta después de cinco intentos', async () => {
    const { service, users } = createFixture()
    await service.register({ name: 'Ana', email: 'ana@example.com', password: 'correcta' })

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.login({
        email: 'ana@example.com',
        password: 'incorrecta',
      })).rejects.toBeInstanceOf(AuthError)
    }

    expect(users.users[0]?.lockedAt).toEqual(new Date('2026-08-24T20:00:00.000Z'))
    await expect(service.login({
      email: 'ana@example.com',
      password: 'correcta',
    })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401 })
  })

  it('usa la misma respuesta para usuario inexistente, inactivo o bloqueado', async () => {
    const { service, users } = createFixture()
    await service.register({ name: 'Ana', email: 'ana@example.com', password: 'correcta' })
    users.users[0]!.isActive = false

    const attempts = [
      service.login({ email: 'nadie@example.com', password: 'incorrecta' }),
      service.login({ email: 'ana@example.com', password: 'correcta' }),
    ]

    for (const attempt of attempts) {
      await expect(attempt).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.',
        status: 401,
      })
    }
  })

  it('revoca el acceso inmediatamente cuando el usuario queda inactivo', async () => {
    const { service, users } = createFixture()
    const registered = await service.register({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'correcta',
    })
    users.users[0]!.isActive = false

    await expect(service.resolveAuthenticatedUser(registered.user.id)).rejects.toMatchObject({
      code: 'USER_NOT_AVAILABLE',
      status: 403,
    })
  })
})
