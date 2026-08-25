import { Hono, type Context, type MiddlewareHandler } from 'hono'
import { z } from 'zod'
import type { AuthService } from './auth-service.js'
import { AuthError } from './errors.js'
import type { PublicUser } from './model.js'
import { permissionsForRole, roleHasPermission, type Permission } from './permissions.js'
import type { AccessTokenService } from './ports.js'

export interface AuthModule {
  service: AuthService
  tokens: AccessTokenService
}

export interface AuthVariables {
  currentUser: PublicUser
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(180),
  email: z.email().max(255),
  password: z.string().min(12).max(128),
}).strict()

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(128),
}).strict()

export function createAuthRouter(auth: AuthModule): Hono<{ Variables: AuthVariables }> {
  const router = new Hono<{ Variables: AuthVariables }>()

  router.post('/register', async (context) => {
    const input = await parseJson(context, registerSchema)
    if (!input.success) return input.response

    const result = await auth.service.register(input.data)
    return context.json(result, 201)
  })

  router.post('/login', async (context) => {
    const input = await parseJson(context, loginSchema)
    if (!input.success) return input.response

    return context.json(await auth.service.login(input.data))
  })

  router.get('/me', authenticate(auth), (context) => {
    const user = context.get('currentUser')
    return context.json({
      user,
      permissions: permissionsForRole(user.role),
    })
  })

  return router
}

export function authenticate(auth: AuthModule): MiddlewareHandler<{ Variables: AuthVariables }> {
  return async (context, next) => {
    const authorization = context.req.header('Authorization')
    const token = extractBearerToken(authorization)
    const { userId } = await auth.tokens.verify(token)
    context.set('currentUser', await auth.service.resolveAuthenticatedUser(userId))
    await next()
  }
}

export function requirePermission(permission: Permission): MiddlewareHandler<{ Variables: AuthVariables }> {
  return async (context, next) => {
    const user = context.get('currentUser')
    if (!roleHasPermission(user.role, permission)) {
      return context.json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para realizar esta acción.',
          requestId: context.get('requestId'),
        },
      }, 403)
    }
    await next()
  }
}

export function authErrorResponse(error: unknown, context: Context) {
  if (!(error instanceof AuthError)) return null
  return context.json({
    error: {
      code: error.code,
      message: error.message,
      requestId: context.get('requestId'),
    },
  }, error.status)
}

function extractBearerToken(authorization: string | undefined): string {
  const [scheme, token, extra] = authorization?.trim().split(/\s+/) ?? []
  if (scheme?.toLowerCase() !== 'bearer' || !token || extra) {
    throw new AuthError('INVALID_TOKEN', 'El token no es válido.', 401)
  }
  return token
}

async function parseJson<TSchema extends z.ZodType>(context: Context, schema: TSchema): Promise<
  | { success: true, data: z.output<TSchema> }
  | { success: false, response: Response }
> {
  try {
    const parsed = schema.safeParse(await context.req.json())
    if (parsed.success) return { success: true, data: parsed.data }
    return {
      success: false,
      response: context.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos.',
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
          requestId: context.get('requestId'),
        },
      }, 400),
    }
  }
  catch {
    return {
      success: false,
      response: context.json({
        error: {
          code: 'INVALID_JSON',
          message: 'El cuerpo debe ser JSON válido.',
          requestId: context.get('requestId'),
        },
      }, 400),
    }
  }
}
