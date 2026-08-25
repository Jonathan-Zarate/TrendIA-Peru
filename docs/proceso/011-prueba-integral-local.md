# Incremento 011 — Prueba integral local contra Neon

**Fecha:** 2026-08-25

## Entorno probado

- Frontend Vite: `http://127.0.0.1:5173`.
- API Hono: `http://127.0.0.1:3000`.
- Base de datos: rama de producción de Neon.
- Viewport responsive comprobado: 390 × 844 píxeles.

## Recorrido público

- El radar mostró tres oportunidades publicadas con puntajes reales.
- La búsqueda por `cabinas` devolvió una coincidencia.
- El filtro `CN` devolvió únicamente live shopping.
- El detalle de cabinas mostró puntaje 76,65, dos fuentes y periodo observado.
- La vista móvil conservó encabezado, navegación, filtros y tarjetas sin pérdida funcional.

## Prueba por rol

| Rol | Resultado web | Permisos devueltos por API |
|---|---|---:|
| ADMIN | Accede a gestión editorial y recibe capacidad de revisión/publicación | 11 |
| ANALYST | Accede a gestión editorial sin acción de publicación | 7 |
| ENTREPRENEUR | Permanece en el radar y no recibe acceso a gestión editorial | 3 |

Las contraseñas no se imprimieron ni se incorporaron a la documentación. Las sesiones de prueba fueron cerradas.

## Hallazgos y correcciones

1. En pantallas móviles se ocultaba toda la navegación, lo que habría dejado inaccesible el panel interno.
2. El contador mostraba `1 oportunidades encontradas`.

Ambos defectos se corrigieron en `ef30ce8` y fueron revalidados en el navegador.

## Compuerta técnica

- Backend: 44 pruebas aprobadas.
- Frontend: TypeScript y ESLint aprobados.
- Build Vite de producción aprobado.
- Catálogo inicial: segunda ejecución idempotente sin duplicados.

## Resultado

El flujo local está preparado para pasar a despliegue. La siguiente verificación debe repetirse sobre las URLs públicas de Vercel, incluyendo CORS y variables de entorno.
