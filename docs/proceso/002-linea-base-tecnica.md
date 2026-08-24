# Registro de proceso 002 — Línea base técnica

- Fecha: 2026-08-24
- Participantes: Jonathan Zarate y Codex

## Pedido

Iniciar la construcción del MVP web de TrendIA Perú sobre una base mantenible y reutilizable por una futura aplicación Android.

## Decisiones implementadas

- Monorepo pnpm con paquetes `frontend`, `backend`, `database` y `shared`.
- Node 22 fijado como runtime de CI y producción.
- TypeScript 6.0.3 en lugar de TypeScript 7.0.2 por estabilidad durante una entrega de cinco días.
- React y Vite para la aplicación web.
- Hono con entradas separadas para Node local y Vercel.
- Drizzle y PostgreSQL preparados sin inventar aún el esquema del dominio.
- CI con instalación congelada, tests, tipos, lint y build.

## Hallazgos del agente

1. `eslint` y `@eslint/js` no comparten actualmente el mismo último número de versión. Se fijó `eslint@10.9.1` con `@eslint/js@10.0.1`, ambos realmente publicados.
2. pnpm 11 bloqueó los scripts de `esbuild` hasta declararlos explícitamente en `allowBuilds`; solo ese paquete quedó autorizado.
3. TypeScript 6 trata `Response.json()` como `unknown`; los tests conservaron el modo estricto y tiparon sus contratos.
4. TypeScript 6 exige `rootDir` explícito en los paquetes que generan artefactos con `outDir`; se corrigieron `database` y `shared`.

## Validación

- 2 pruebas del backend aprobadas.
- Typecheck aprobado en los cuatro paquetes.
- ESLint aprobado sin advertencias de configuración.
- Build aprobado para frontend, backend, database y shared.
- Bundle inicial del frontend: aproximadamente 191 kB antes de gzip y 60 kB comprimido.

## Trabajo aún no iniciado

- Modelo de datos del dominio.
- Autenticación y roles.
- Integración con Neon.
- Proveedor de IA.
- Repositorio remoto y despliegue.

