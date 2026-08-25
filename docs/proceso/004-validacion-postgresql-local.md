# 004 — Validación de PostgreSQL local

**Fecha:** 2026-08-24

## Qué se pidió al agente

Aplicar la primera migración sobre PostgreSQL real y tratar de romper las reglas críticas antes de conectar Neon.

## Qué verifiqué como desarrollador

- Conexión aislada con el rol y la base `trendia_dev` sobre PostgreSQL 18.4.
- Creación de las 8 tablas, relaciones, índices y triggers de la migración inicial.
- Rechazo de una configuración cuyos pesos no suman 100.
- Rechazo de la publicación de una tendencia sin fuente activa.
- Rechazo de un índice total distinto del resultado ponderado.
- Aceptación de una tendencia con fuente y una evaluación consistente.
- Reversión de todos los datos de prueba mediante `ROLLBACK`.

## Corrección realizada al trabajo del agente

La primera propuesta de prueba podía fallar antes por una clave foránea y no demostraba de forma aislada la restricción de pesos. Se reemplazó por un escenario transaccional completo que crea primero las dependencias válidas y luego prueba cada regla específica.

## Evidencia reproducible

```powershell
$env:PGPASSWORD='<clave-local>'
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' `
  -X -w -h localhost -U trendia_dev -d trendia_dev `
  -f 'database\preflight\integrity-check.sql'
Remove-Item Env:PGPASSWORD
```

La clave local no se guarda en Git. El script finaliza con el mensaje:

```text
PASS: migracion e integridad de negocio verificadas
```

## Decisión siguiente

Mantener este preflight como parte de la evidencia del proyecto y repetirlo en Neon antes de desarrollar autenticación y RBAC.
