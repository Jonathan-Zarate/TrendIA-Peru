# Incremento 010 — Tendencias iniciales con evidencia

**Fecha:** 2026-08-25

## Propósito

Publicar un conjunto pequeño de oportunidades que permita demostrar el recorrido completo del producto sin presentar ejemplos inventados como hechos.

## Tendencias seleccionadas

1. **Cabinas fotográficas coreanas personalizadas** — señal internacional de VisitKorea y señal local de comunidades juveniles K-pop documentada por TVPerú.
2. **Live shopping para microempresas peruanas** — estadísticas oficiales de China y adopción de campañas digitales por MYPE reportada por PRODUCE.
3. **Micromercados autónomos con pago digital** — caso de uso documentado por METI de Japón y madurez local de pagos digitales reportada por el BCRP.

Las fuentes, fechas de consulta y notas de evidencia están almacenadas en `trend_sources`, no solo escritas en este documento.

## Criterio aplicado a los puntajes

- Los indicadores internacionales y locales se justifican con las fuentes registradas.
- Competencia, inversión e implementación son estimaciones iniciales explícitas, no mediciones de mercado concluyentes.
- El índice prioriza interés local (25 %) y crecimiento internacional (20 %).
- El puntaje orienta qué investigar primero; no garantiza éxito comercial.

## Ejecución real en Neon

Primera ejecución:

- `cabinas-fotograficas-coreanas-personalizadas` publicada.
- `live-shopping-para-microempresas-peruanas` publicada.
- `micromercados-autonomos-con-pago-digital` publicada.

Segunda ejecución:

- Las tres tendencias fueron detectadas como existentes y omitidas.
- No se crearon duplicados.

Cada tendencia recorrió el servicio de dominio: borrador → fuentes → evaluación → revisión → publicación. El script no evitó las reglas mediante inserciones directas.

## Reproducción

1. Provisionar categoría y pesos con `pnpm --filter @trendia/backend seed:catalog`.
2. Provisionar usuarios demo con `pnpm --filter @trendia/backend seed:demo`.
3. Ejecutar `pnpm --filter @trendia/backend seed:trends` con `DATABASE_URL` disponible.

El script requiere un ADMIN activo con correo `admin@trendia.demo` y se detiene si el prerrequisito no existe.
