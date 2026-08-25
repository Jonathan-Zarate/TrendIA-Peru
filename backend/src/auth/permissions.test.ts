import { describe, expect, it } from 'vitest'
import { permissionsForRole, roleHasPermission } from './permissions.js'

describe('RBAC', () => {
  it('reserva publicación y administración para ADMIN', () => {
    expect(roleHasPermission('ADMIN', 'trend:publish')).toBe(true)
    expect(roleHasPermission('ADMIN', 'user:manage')).toBe(true)
    expect(roleHasPermission('ANALYST', 'trend:publish')).toBe(false)
    expect(roleHasPermission('ENTREPRENEUR', 'user:manage')).toBe(false)
  })

  it('permite investigar al ANALYST sin darle administración', () => {
    expect(roleHasPermission('ANALYST', 'trend:draft-manage')).toBe(true)
    expect(roleHasPermission('ANALYST', 'trend:evaluate')).toBe(true)
    expect(roleHasPermission('ANALYST', 'scoring:manage')).toBe(false)
  })

  it('limita al ENTREPRENEUR a su perfil, ideas y análisis propios', () => {
    expect(permissionsForRole('ENTREPRENEUR')).toEqual([
      'profile:read',
      'idea:create',
      'analysis:read-own',
    ])
  })
})
