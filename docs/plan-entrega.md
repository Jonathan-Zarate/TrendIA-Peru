# Plan de entrega — 24 al 29 de agosto de 2026

## Principios de ejecución

- Commits pequeños con pedido, decisión y validación observables.
- Documentación antes o junto con decisiones importantes.
- Ninguna funcionalidad de backend sin consumidor en el recorrido del MVP.
- Evidencia generada por el sistema real.
- Alcance nuevo implica retirar o reprogramar otro elemento.

## Día 1 — Base y dominio

- Discovery, PRD, ADR y backlog.
- Monorepo, herramientas y CI.
- Esquema inicial de usuarios, tendencias, fuentes y puntuaciones.
- Contratos de API y datos de demostración.

## Día 2 — Acceso y catálogo

- Autenticación y RBAC.
- Catálogo de tendencias, filtros y detalle.
- Administración de tendencias y fuentes.
- Pruebas de permisos y paginación.

## Día 3 — Oportunidad e IA

- Motor explicable de puntuación.
- Persistencia del desglose y versión de pesos.
- Adaptador de IA real y adaptador simulado.
- Revisión humana y trazabilidad del análisis.

## Día 4 — Validación y reporte

- Constructor y publicación de encuestas.
- Respuestas públicas con controles básicos de abuso.
- Panel de resultados por ciudad.
- Reporte descargable.

## Día 5 — Producción y presentación

- Neon, Vercel y variables protegidas.
- Pruebas E2E por rol y smoke de producción.
- Prueba de concurrencia y abuso de endpoints públicos.
- Revisión visual, accesibilidad y datos de demostración.
- Guion, arquitectura, decisiones, limitaciones y siguientes pasos.

## Recorte obligatorio si existe retraso

1. Mantener autenticación, catálogo, índice y análisis.
2. Mantener una encuesta sencilla y resultados agregados.
3. Reducir el reporte a HTML imprimible antes de implementar PDF complejo.
4. No incorporar mapa, alertas, Kanban, scraping ni Android.

