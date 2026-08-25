import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { authErrorResponse, createAuthRouter, type AuthModule, type AuthVariables } from './auth/http.js'

interface AppDependencies {
  auth?: AuthModule
}

export function createApp(dependencies: AppDependencies = {}) {
  const application = new Hono<{ Variables: AuthVariables }>()

  application.use('*', requestId())

  application.get('/health/live', (context) => context.json({
    status: 'ok',
    service: 'trendia-api',
    requestId: context.get('requestId'),
  }))

  if (dependencies.auth) {
    application.route('/api/auth', createAuthRouter(dependencies.auth))
  }

  application.onError((error, context) => authErrorResponse(error, context) ?? context.json({
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
