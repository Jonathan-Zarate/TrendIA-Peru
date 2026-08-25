# 008 — Catálogo y flujo editorial de tendencias

**Fecha:** 2026-08-25

## Objetivo

Construir el catálogo público paginado y el flujo mínimo con el que un analista convierte una observación en una tendencia publicable con fuente verificable.

## Reglas implementadas

- El catálogo público consulta exclusivamente tendencias `PUBLISHED`.
- Los borradores y elementos en revisión solo aparecen en `/api/trends/manage`, protegido por autenticación y permiso.
- La página empieza en 1, el tamaño predeterminado es 12 y el máximo es 50.
- El orden usa fecha relevante descendente e ID como desempate estable.
- La búsqueda cubre título y resumen; los filtros incluyen categoría y país de origen.
- El slug se genera en servidor a partir del título y su unicidad se resuelve sin carrera mediante `ON CONFLICT`.
- Solo `ANALYST` o `ADMIN` crean borradores, agregan fuentes y envían a revisión.
- Solo `ADMIN` publica.
- Un borrador necesita una fuente activa antes de pasar a `IN_REVIEW`.
- Solo `IN_REVIEW` puede convertirse en `PUBLISHED`.
- El trigger de PostgreSQL continúa siendo la última defensa para impedir publicaciones sin fuente.

## Endpoints incorporados

```text
GET  /api/trends
GET  /api/trends/:slug
GET  /api/trends/manage
POST /api/trends
POST /api/trends/:id/sources
POST /api/trends/:id/submit-review
POST /api/trends/:id/publish
```

## Decisiones técnicas

- El repositorio usa consultas parametrizadas; ningún filtro concatena SQL del usuario.
- La última evaluación se obtiene con `LEFT JOIN LATERAL`, evitando duplicar tendencias en el catálogo.
- Listado y conteo comparten exactamente las mismas condiciones.
- El catálogo devuelve metadatos `page`, `limit`, `total` y `totalPages`.
- La categoría inicial se provisiona mediante un script idempotente y permanece como configuración del MVP.

## Smoke real en Neon

Se ejecutó el recorrido con usuarios demo y un dato temporal:

```text
DraftStatus         : DRAFT
HiddenBeforePublish : True
VisibleInManage     : True
SourceCreated       : True
ReviewStatus        : IN_REVIEW
PublishStatus       : PUBLISHED
VisibleAfterPublish : True
DetailSources       : 1
```

La tendencia temporal y su fuente se eliminaron al finalizar. La categoría `tecnologia-negocios-consumo` se conservó porque forma parte de la configuración funcional.

## Compuerta de calidad

```text
Test Files  9 passed (9)
Tests      40 passed (40)
TypeScript backend: OK
TypeScript database: OK
ESLint: OK
Build backend: OK
Build database: OK
```

## Siguiente paso

Construir la interfaz web de login y catálogo consumiendo estos endpoints, con estados visibles de carga, vacío y error.
