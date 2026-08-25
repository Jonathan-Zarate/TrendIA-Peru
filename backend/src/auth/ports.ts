import type { AuthUser, UserRole } from './model.js'

export interface CreateUserInput {
  name: string
  email: string
  passwordHash: string
  role: UserRole
}

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>
  findById(id: string): Promise<AuthUser | null>
  create(input: CreateUserInput): Promise<AuthUser>
  recordFailedLogin(id: string, maximumAttempts: number, occurredAt: Date): Promise<void>
  resetFailedLogins(id: string): Promise<void>
}

export interface PasswordHasher {
  hash(password: string): Promise<string>
  verify(password: string, hash: string): Promise<boolean>
}

export interface AccessTokenService {
  issue(userId: string): Promise<string>
  verify(token: string): Promise<{ userId: string }>
}
