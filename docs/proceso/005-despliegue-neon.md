# 005 — Despliegue y validación en Neon

**Fecha:** 2026-08-24

## Qué se pidió al agente

Crear una base PostgreSQL administrada para TrendIA, aplicar el esquema versionado y demostrar que las reglas se comportan igual que en el entorno local.

## Configuración elegida

- Proyecto: `TrendIA Peru`.
- Proveedor: AWS.
- Región: South America East 1 (São Paulo), la más cercana disponible para Perú.
- PostgreSQL: 18.
- Rama principal: `production`.
- Base inicial: `neondb`.
- Neon Auth: desactivado; la autenticación y el RBAC pertenecen al backend para no acoplar el dominio al proveedor.
- Pooling: habilitado para la futura ejecución serverless del backend.

No se guarda la cadena de conexión en Git ni en esta documentación.

## Incidencia y corrección

Durante el aprovisionamiento, la consola permaneció bloqueada y terminó creando dos proyectos con el mismo nombre. Se verificaron sus identificadores y actividad antes de actuar:

- Se conservó `blue-bread-15331912`, que tenía el compute activo.
- Se eliminó `morning-hat-14416048`, que estaba vacío e inactivo.

La eliminación se hizo solo después de identificar el objetivo exacto y recibir confirmación del propietario.

## Migración aplicada

Se ejecutó `database/migrations/0000_mean_gateway.sql` en la rama `production`. Neon procesó correctamente las 38 sentencias de creación y alteración.

Verificación independiente:

```sql
SELECT
  current_setting('server_version') AS postgres_version,
  (SELECT count(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS table_count,
  (SELECT count(DISTINCT trigger_name) FROM information_schema.triggers
   WHERE trigger_schema = 'public'
     AND trigger_name IN (
       'trg_validate_opportunity_evaluation',
       'trg_require_source_before_publish'
     )) AS business_trigger_count;
```

Resultado observado:

```text
postgres_version: 18.6
table_count: 8
business_trigger_count: 2
```

## Preflight de integridad

Se ejecutó `database/preflight/integrity-check.sql`. El editor web no interpreta el metacomando de `psql` `\set ON_ERROR_STOP on`, por lo que esa única línea se retiró de la copia ejecutada en la interfaz. El cuerpo SQL no se modificó.

Resultado final:

```text
PASS: migracion e integridad de negocio verificadas
```

El preflight terminó con `ROLLBACK`, por lo que no dejó datos de prueba en Neon.

## Decisión siguiente

Usar este proyecto como infraestructura oficial del MVP y comenzar autenticación propia con permisos `ADMIN`, `ANALYST` y `ENTREPRENEUR`.
