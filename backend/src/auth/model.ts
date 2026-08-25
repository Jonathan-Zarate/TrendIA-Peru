export const USER_ROLES = ['ADMIN', 'ANALYST', 'ENTREPRENEUR'] as const

export type UserRole = typeof USER_ROLES[number]

export interface AuthUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  failedLoginAttempts: number
  lockedAt: Date | null
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export function toPublicUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}
