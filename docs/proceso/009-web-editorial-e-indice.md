# Incremento 009 — Web editorial e índice de oportunidad

**Fecha:** 2026-08-25

## Objetivo

Convertir el catálogo técnico del backend en un flujo web demostrable y cerrar la pieza central del producto: una evaluación explicable, calculada por el servidor y validada nuevamente por PostgreSQL.

## Decisiones tomadas antes de implementar

- Separar catálogo público, detalle, autenticación y gestión editorial en componentes distintos.
- Obtener las categorías mediante API. El frontend no conoce UUID de Neon.
- Conservar el JWT en `sessionStorage`, nunca las contraseñas, y revalidar `/api/auth/me` al recargar.
- Mantener la autorización real en el servidor aunque la interfaz adapte las acciones por rol.
- Exigir una justificación por cada criterio del índice; un número aislado no constituye evidencia.
- Calcular el total con la configuración activa del servidor. PostgreSQL vuelve a verificarlo mediante `trg_validate_opportunity_evaluation`.

## Qué se pidió al agente

- Construir la primera experiencia pública responsive del radar.
- Conectar inicio de sesión y navegación por roles.
- Implementar el flujo borrador → evidencia → revisión → publicación.
- Detectar vacíos antes de sembrar información de demostración.

## Qué revisé y corregí durante el trabajo

- Se corrigió el proxy de Vite porque eliminaba `/api` y producía rutas inexistentes.
- Se evitó incrustar el UUID de la categoría en la web agregando `GET /api/trends/categories`.
- Se aplazó la carga de tendencias: sin evaluación persistida, el catálogo habría mostrado contenido incompleto.
- Se restringió CORS a orígenes configurados en `APP_ORIGIN` y localhost para desarrollo.

## Evidencia ejecutada

- Backend: 9 archivos de prueba, 44 pruebas aprobadas.
- TypeScript y ESLint aprobados en frontend, backend y base de datos.
- Build Vite de producción aprobado.
- Neon: categoría `tecnologia-negocios-consumo` y configuración base de pesos provisionadas de forma idempotente.

## Commits del incremento

- `c227543` — radar público.
- `edeee58` — detalle trazable.
- `b959d95` — política CORS.
- `f8d21ad` — sesión web.
- `4267fca` — panel por roles.
- `12db2dd` — categorías por API.
- `20802c9` — flujo editorial web.
- `c1052e6` — índice persistido.
- `3f068f0` — evaluación explicable en la interfaz.

## Siguiente decisión

Investigar un conjunto pequeño de tendencias con fuentes primarias internacionales y peruanas. Los puntajes de demostración se cargarán únicamente con justificaciones que referencien esas fuentes.
