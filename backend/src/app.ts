import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { authErrorResponse, createAuthRouter, type AuthModule, type AuthVariables } from './auth/http.js'
import { createTrendRouter, trendErrorResponse, type TrendModule } from './trends/http.js'

interface AppDependencies {
  auth?: AuthModule
  trends?: TrendModule
  allowedOrigins?: string[]
}

export function createApp(dependencies: AppDependencies = {}) {
  const application = new Hono<{ Variables: AuthVariables }>()
  const allowedOrigins = dependencies.allowedOrigins ?? ['http://localhost:5173']

  application.use('*', requestId())
  application.use('/api/*', cors({
    origin: (origin) => allowedOrigins.includes(origin) ? origin : '',
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 600,
  }))

  application.get('/health/live', (context) => context.json({
    status: 'ok',
    service: 'trendia-api',
    requestId: context.get('requestId'),
  }))

  if (dependencies.auth) {
    application.route('/api/auth', createAuthRouter(dependencies.auth))
  }

  if (dependencies.auth && dependencies.trends) {
    application.route('/api/trends', createTrendRouter(dependencies.trends, dependencies.auth))
  }

  application.onError((error, context) => authErrorResponse(error, context)
    ?? trendErrorResponse(error, context)
    ?? context.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado.',
      requestId: context.get('requestId'),
    },
    }, 500))

  application.notFound((context) => context.json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'La ruta solicitada no existe.',
      requestId: context.get('requestId'),
    },
  }, 404))

  return application
}

export const app = createApp()
