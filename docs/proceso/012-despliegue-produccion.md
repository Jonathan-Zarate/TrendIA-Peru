# Incremento 012 — Despliegue y prueba integral de producción

**Fecha:** 2026-08-28

## Objetivo

Publicar la API y la aplicación web en Vercel, conectarlas con la rama de producción de Neon y verificar el recorrido público sobre infraestructura real.

## Decisiones aplicadas

- La API se despliega desde la raíz del monorepo para conservar `backend` y `database` durante la instalación y compilación.
- El frontend permanece desplegable como paquete independiente y declara su compilador y configuración TypeScript sin depender del hoisting local.
- `DATABASE_URL` y `JWT_ACCESS_SECRET` se cargaron como variables sensibles de Vercel y no se imprimieron ni versionaron.
- `VITE_API_URL` contiene únicamente la URL pública de la API; por diseño es visible en el bundle del navegador.
- La API restringe CORS mediante `APP_ORIGIN` a la URL pública del frontend, además del origen local de desarrollo.

## Incidencias encontradas y correcciones

1. El primer build de la API ejecutó `npm install` dentro de `backend` y no pudo resolver `workspace:*`. Se movió el punto de despliegue a la raíz y se fijó el flujo de instalación y build con pnpm.
2. El primer entrypoint raíz importaba `hono` fuera del paquete que lo declara. Se cambió a un adaptador que carga el backend ya compilado.
3. Vercel interpretó el export por defecto como firma Node y descartó el `Response` Fetch. Se declararon handlers HTTP nombrados para el runtime Fetch.
4. El frontend dependía implícitamente de TypeScript y del `tsconfig` de la raíz. Se hicieron explícitos dentro del paquete para lograr un build aislado y reproducible.

Cada corrección se registró en un commit independiente antes del siguiente intento.

## Evidencia de producción

- `GET https://trendia-peru-api.vercel.app/health/live`: `200 OK`, estado `ok` y `requestId`.
- `GET /api/trends?page=1&limit=10`: tres tendencias publicadas recuperadas desde Neon.
- `https://trendia-peru.vercel.app/`: `200 OK` y catálogo renderizado con tres oportunidades.
- Recarga directa de `/tendencias/micromercados-autonomos-con-pago-digital`: `200 OK`.
- Navegación visual desde el radar al detalle: título, puntaje, fuentes y periodo observado visibles.
- Consola del navegador durante el recorrido: sin errores.

## Resultado

El recorrido público funciona de extremo a extremo en producción: navegador → frontend Vercel → API Vercel → PostgreSQL/Neon. El despliegue no se consideró correcto hasta comprobar respuestas HTTP y contenido renderizado, aunque el panel de Vercel ya indicara estado listo.
