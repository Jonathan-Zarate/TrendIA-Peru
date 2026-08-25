import { describe, expect, it } from 'vitest'
import { app, createApp } from './app.js'

describe('health', () => {
  it('confirma que la API está viva y entrega trazabilidad', async () => {
    const response = await app.request('/health/live')
    const body = await response.json() as {
      status: string
      service: string
      requestId: string
    }

    expect(response.status).toBe(200)
    expect(body).toMatchObject({ status: 'ok', service: 'trendia-api' })
    expect(body.requestId).toEqual(expect.any(String))
  })

  it('responde errores consistentes para rutas inexistentes', async () => {
    const response = await app.request('/ruta-inexistente')
    const body = await response.json() as {
      error: {
        code: string
        message: string
        requestId: string
      }
    }

    expect(response.status).toBe(404)
    expect(body.error).toMatchObject({
      code: 'ROUTE_NOT_FOUND',
      message: 'La ruta solicitada no existe.',
    })
    expect(body.error.requestId).toEqual(expect.any(String))
  })

  it('habilita CORS solo para el frontend configurado', async () => {
    const application = createApp({ allowedOrigins: ['https://trendia.example'] })
    const allowed = await application.request('/api/trends', { method: 'OPTIONS', headers: { Origin: 'https://trendia.example', 'Access-Control-Request-Method': 'GET' } })
    const rejected = await application.request('/api/trends', { method: 'OPTIONS', headers: { Origin: 'https://malicious.example', 'Access-Control-Request-Method': 'GET' } })

    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://trendia.example')
    expect(rejected.headers.get('access-control-allow-origin')).toBeNull()
  })
})
