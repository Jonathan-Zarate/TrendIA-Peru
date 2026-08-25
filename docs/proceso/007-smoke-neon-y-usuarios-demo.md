# 007 — Smoke de autenticación en Neon y usuarios demo

**Fecha:** 2026-08-24

## Objetivo

Comprobar la autenticación de extremo a extremo contra la base oficial de Neon y dejar usuarios demo reproducibles sin publicar contraseñas.

## Manejo de secretos

- La cadena de conexión con pooling se obtuvo del proyecto oficial `TrendIA Peru`.
- Se generó un secreto JWT aleatorio de 48 bytes.
- `.env.local` contiene la conexión de desarrollo y el secreto JWT.
- `.env.demo.local` contiene además las credenciales demo.
- Ambos nombres coinciden con las reglas `.env.*` de `.gitignore`.
- Ningún token, contraseña ni cadena de conexión se imprimió en la evidencia o se añadió a Git.

## Hallazgo operativo

El compute de Neon apareció como `SUSPENDED` después del periodo de inactividad. Esto es el comportamiento esperado del plan con scale-to-zero, no una pérdida de base de datos. Al solicitar conexión pasó a `Idle` y atendió las pruebas.

El backend debe tolerar el primer acceso más lento después de una suspensión y mantener un `connect_timeout` explícito.

## Primer smoke test

Flujo ejecutado contra Neon:

1. `POST /api/auth/register` con un correo único temporal.
2. `POST /api/auth/login`.
3. `GET /api/auth/me` con el Bearer token.
4. Eliminación exclusiva del usuario temporal.

Resultado:

```text
RegisterRole       : ENTREPRENEUR
Login              : OK
MeRole             : ENTREPRENEUR
PermissionCount    : 3
HasAdminPermission : False
```

## Provisioning demo

`backend/scripts/seed-demo-users.ts` crea o actualiza de forma idempotente:

- `admin@trendia.demo` como `ADMIN`.
- `analyst@trendia.demo` como `ANALYST`.
- `entrepreneur@trendia.demo` como `ENTREPRENEUR`.

Las contraseñas se reciben exclusivamente mediante variables de entorno. Cada reejecución actualiza nombre, hash, rol y estado; además limpia bloqueos anteriores.

## Validación por rol

```text
Role         Login Permissions Expected Matches
ADMIN        OK             11       11    True
ANALYST      OK              7        7    True
ENTREPRENEUR OK              3        3    True
```

## Compuerta final

```text
Test Files  7 passed (7)
Tests      30 passed (30)
TypeScript backend: OK
TypeScript database: OK
ESLint: OK
Build backend: OK
Build database: OK
```

## Siguiente paso

Construir el catálogo de tendencias publicadas y la gestión de borradores/fuentes para `ANALYST`, reutilizando el middleware RBAC ya verificado.
