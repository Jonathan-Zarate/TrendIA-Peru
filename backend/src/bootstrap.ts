import { PostgresTrendStore, PostgresUserStore } from '@trendia/database'
import { createApp } from './app.js'
import { AuthService } from './auth/auth-service.js'
import { HonoJwtTokenService } from './auth/adapters/hono-jwt-token-service.js'
import { ScryptPasswordHasher } from './auth/adapters/scrypt-password-hasher.js'
import { TrendService } from './trends/trend-service.js'

export function createProductionApp(environment: NodeJS.ProcessEnv = process.env) {
  const databaseUrl = requireEnvironmentVariable(environment, 'DATABASE_URL')
  const jwtSecret = requireEnvironmentVariable(environment, 'JWT_ACCESS_SECRET')
  const users = new PostgresUserStore(databaseUrl)
  const trends = new PostgresTrendStore(databaseUrl)
  const tokens = new HonoJwtTokenService(jwtSecret)
  const service = new AuthService({
    users,
    tokens,
    passwords: new ScryptPasswordHasher(),
  })

  return createApp({
    auth: { service, tokens },
    trends: { service: new TrendService(trends) },
  })
}

function requireEnvironmentVariable(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim()
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`)
  return value
}
