import { Hono } from 'hono'
import { requestId } from 'hono/request-id'

export const app = new Hono()

app.use('*', requestId())

app.get('/health/live', (context) => context.json({
  status: 'ok',
  service: 'trendia-api',
  requestId: context.get('requestId'),
}))

app.notFound((context) => context.json({
  error: {
    code: 'ROUTE_NOT_FOUND',
    message: 'La ruta solicitada no existe.',
    requestId: context.get('requestId'),
  },
}, 404))

