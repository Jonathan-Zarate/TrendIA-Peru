import { describe, expect, it } from 'vitest'
import { HonoJwtTokenService } from './hono-jwt-token-service.js'

const SECRET = 'trendia-test-secret-with-at-least-32-characters'

describe('HonoJwtTokenService', () => {
  it('emite y verifica un token con identidad mínima', async () => {
    const tokens = new HonoJwtTokenService(SECRET)
    const token = await tokens.issue('user-123')

    await expect(tokens.verify(token)).resolves.toEqual({ userId: 'user-123' })
  })

  it('rechaza tokens manipulados', async () => {
    const tokens = new HonoJwtTokenService(SECRET)
    const token = await tokens.issue('user-123')
    const manipulated = `${token.slice(0, -2)}xx`

    await expect(tokens.verify(manipulated)).rejects.toMatchObject({
      code: 'INVALID_TOKEN',
      status: 401,
    })
  })

  it('exige un secreto de longitud segura', () => {
    expect(() => new HonoJwtTokenService('demasiado-corto')).toThrow(
      'JWT_ACCESS_SECRET debe tener al menos 32 caracteres.',
    )
  })
})
