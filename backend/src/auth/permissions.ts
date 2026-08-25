import type { UserRole } from './model.js'

export const PERMISSIONS = [
  'profile:read',
  'idea:create',
  'analysis:read-own',
  'trend:draft-manage',
  'trend:source-manage',
  'trend:evaluate',
  'trend:submit-review',
  'trend:publish',
  'user:manage',
  'scoring:manage',
  'audit:read',
] as const

export type Permission = typeof PERMISSIONS[number]

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  ENTREPRENEUR: new Set([
    'profile:read',
    'idea:create',
    'analysis:read-own',
  ]),
  ANALYST: new Set([
    'profile:read',
    'idea:create',
    'analysis:read-own',
    'trend:draft-manage',
    'trend:source-manage',
    'trend:evaluate',
    'trend:submit-review',
  ]),
  ADMIN: new Set(PERMISSIONS),
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission)
}

export function permissionsForRole(role: UserRole): Permission[] {
  return [...ROLE_PERMISSIONS[role]]
}
