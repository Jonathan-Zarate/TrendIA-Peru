import { sign, verify } from 'hono/jwt'
import { AuthError } from '../errors.js'
import type { AccessTokenService } from '../ports.js'

const ISSUER = 'trendia-api'
const AUDIENCE = 'trendia-clients'

export class HonoJwtTokenService implements AccessTokenService {
  constructor(
    private readonly secret: string,
    private readonly accessTokenTtlSeconds = 15 * 60,
    private readonly nowInSeconds: () => number = () => Math.floor(Date.now() / 1000),
  ) {
    if (secret.length < 32) {
      throw new Error('JWT_ACCESS_SECRET debe tener al menos 32 caracteres.')
    }
  }

  async issue(userId: string): Promise<string> {
    const issuedAt = this.nowInSeconds()
    return await sign({
      sub: userId,
      iss: ISSUER,
      aud: AUDIENCE,
      iat: issuedAt,
      exp: issuedAt + this.accessTokenTtlSeconds,
    }, this.secret, 'HS256')
  }

  async verify(token: string): Promise<{ userId: string }> {
    try {
      const payload = await verify(token, this.secret, 'HS256')
      if (
        typeof payload.sub !== 'string'
        || payload.iss !== ISSUER
        || payload.aud !== AUDIENCE
      ) {
        throw invalidToken()
      }
      return { userId: payload.sub }
    }
    catch {
      throw invalidToken()
    }
  }
}

function invalidToken(): AuthError {
  return new AuthError('INVALID_TOKEN', 'El token no es válido.', 401)
}
