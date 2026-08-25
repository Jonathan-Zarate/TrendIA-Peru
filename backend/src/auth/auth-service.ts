import { AuthError } from './errors.js'
import { toPublicUser, type PublicUser } from './model.js'
import type { AccessTokenService, PasswordHasher, UserRepository } from './ports.js'

const MAXIMUM_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResult {
  accessToken: string
  user: PublicUser
}

interface AuthServiceDependencies {
  users: UserRepository
  passwords: PasswordHasher
  tokens: AccessTokenService
  now?: () => Date
}

export class AuthService {
  private readonly now: () => Date

  constructor(private readonly dependencies: AuthServiceDependencies) {
    this.now = dependencies.now ?? (() => new Date())
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email)
    const existingUser = await this.dependencies.users.findByEmail(email)

    if (existingUser) {
      throw new AuthError(
        'EMAIL_ALREADY_REGISTERED',
        'El correo ya está registrado.',
        409,
      )
    }

    const user = await this.dependencies.users.create({
      name: input.name.trim(),
      email,
      passwordHash: await this.dependencies.passwords.hash(input.password),
      role: 'ENTREPRENEUR',
    })

    if (!user) {
      throw new AuthError(
        'EMAIL_ALREADY_REGISTERED',
        'El correo ya está registrado.',
        409,
      )
    }

    return this.createResult(user)
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.dependencies.users.findByEmail(normalizeEmail(input.email))

    if (!user || !user.isActive || this.isLocked(user.lockedAt)) {
      throw invalidCredentials()
    }

    const passwordMatches = await this.dependencies.passwords.verify(
      input.password,
      user.passwordHash,
    )

    if (!passwordMatches) {
      await this.dependencies.users.recordFailedLogin(
        user.id,
        MAXIMUM_LOGIN_ATTEMPTS,
        this.now(),
      )
      throw invalidCredentials()
    }

    if (user.failedLoginAttempts > 0 || user.lockedAt) {
      await this.dependencies.users.resetFailedLogins(user.id)
    }

    return this.createResult(user)
  }

  async resolveAuthenticatedUser(userId: string): Promise<PublicUser> {
    const user = await this.dependencies.users.findById(userId)

    if (!user || !user.isActive) {
      throw new AuthError(
        'USER_NOT_AVAILABLE',
        'El usuario ya no tiene acceso.',
        403,
      )
    }

    return toPublicUser(user)
  }

  private isLocked(lockedAt: Date | null): boolean {
    if (!lockedAt) return false
    return this.now().getTime() - lockedAt.getTime() < LOCK_DURATION_MS
  }

  private async createResult(user: Parameters<typeof toPublicUser>[0]): Promise<AuthResult> {
    return {
      accessToken: await this.dependencies.tokens.issue(user.id),
      user: toPublicUser(user),
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function invalidCredentials(): AuthError {
  return new AuthError(
    'INVALID_CREDENTIALS',
    'Correo o contraseña incorrectos.',
    401,
  )
}
