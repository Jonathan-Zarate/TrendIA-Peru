# TrendIA Perú

Plataforma web para identificar tendencias internacionales, estimar su oportunidad en el mercado peruano y convertirlas en ideas validadas de negocio.

## Estado

Proyecto iniciado el 24 de agosto de 2026. La primera meta es presentar un MVP web funcional el sábado 29 de agosto de 2026.

Actualmente están operativos sobre PostgreSQL/Neon:

- Registro, login y consulta de sesión con JWT.
- RBAC para `ADMIN`, `ANALYST` y `ENTREPRENEUR`.
- Catálogo público paginado con búsqueda y filtros.
- Interfaz responsive con detalle y fuentes trazables.
- Vista interna de tendencias por estado.
- Creación de borradores, registro de fuentes y evaluación explicable por analistas.
- Transición controlada de borrador a revisión y publicación exclusiva por administración.
- Índice calculado en backend y reconciliado por PostgreSQL con pesos versionados.
- Restricciones de integridad y smoke tests reales contra Neon.

## Flujo principal

1. Registrar una tendencia y sus fuentes.
2. Evaluar su oportunidad para Perú con criterios explicables.
3. Generar una propuesta de adaptación asistida por IA.
4. Validar la propuesta mediante una encuesta.
5. Consultar resultados y generar un reporte.

## Alcance inicial

- Aplicación web responsive.
- API REST reutilizable por una futura aplicación Android.
- Catálogo, búsqueda y filtros de tendencias.
- Índice de oportunidad explicable.
- Análisis asistido por IA con trazabilidad.
- Encuestas y panel de resultados.
- Autenticación, autorización y auditoría.

La aplicación Android, el scraping de redes sociales, las alertas automáticas y el tablero Kanban quedan fuera del primer MVP.

## Documentación

- `docs/discovery.md`: problema, usuarios, hipótesis y riesgos.
- `docs/PRD-MVP.md`: requisitos y criterios de aceptación.
- `docs/decisiones/ADR-001-arquitectura-web-first.md`: arquitectura inicial.
- `docs/plan-entrega.md`: plan incremental hasta la presentación.
- `docs/proceso/001-inicio-del-proyecto.md`: primera evidencia del proceso.
- `docs/seguridad-y-permisos.md`: matriz RBAC y reglas de autenticación.
- `docs/proceso/008-catalogo-y-flujo-editorial.md`: evidencia del catálogo en Neon.
- `docs/proceso/009-web-editorial-e-indice.md`: decisiones y evidencia de la web y el índice.
