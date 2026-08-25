# 006 — Núcleo de autenticación y RBAC

**Fecha:** 2026-08-24

## Qué se pidió al agente

Implementar autenticación propia y permisos para `ADMIN`, `ANALYST` y `ENTREPRENEUR`, manteniendo la API reutilizable por web y una futura aplicación Android.

## Decisiones tomadas antes del código

- El registro público fuerza `ENTREPRENEUR`; nunca acepta un rol enviado por el cliente.
- El JWT identifica la sesión, pero el usuario activo y su rol se consultan en PostgreSQL en cada solicitud protegida.
- La autorización usa permisos centralizados y no comparaciones de roles dispersas.
- La lógica depende de `UserRepository`, `PasswordHasher` y `AccessTokenService` como puertos.
- PostgreSQL, scrypt y JWT son adaptadores intercambiables.

## Correcciones hechas durante el incremento

1. La descarga de dependencias nuevas falló repetidamente por timeouts del registro npm. Se detuvo sin aceptar versiones parciales. Se usó `node:crypto` para scrypt y el JWT incluido por Hono, reduciendo dependencias.
2. TypeScript detectó que `promisify` perdía la sobrecarga de opciones de scrypt. Se reemplazó por una promesa explícita que conserva costo, paralelización y límite de memoria.
3. Una prueba generó un token con fecha de emisión futura. La implementación lo rechazó correctamente y se corrigió el reloj del test.
4. La creación del repositorio cambió a resultado anulable con `ON CONFLICT DO NOTHING`, cerrando la carrera entre dos registros simultáneos del mismo correo.

## Controles implementados

- Contraseñas con scrypt, salt aleatorio y comparación de tiempo constante.
- Secreto JWT mínimo de 32 caracteres y acceso de 15 minutos.
- Emisor y audiencia validados.
- Bloqueo temporal después de cinco intentos consecutivos.
- Mensaje indistinguible para usuario inexistente, inactivo, bloqueado o contraseña incorrecta.
- JSON estricto y errores con `requestId`.
- Actualización atómica de intentos fallidos en PostgreSQL.
- Pool limitado y compatible con ejecución serverless.

## Evidencia

```text
Test Files  7 passed (7)
Tests      30 passed (30)
TypeScript backend: OK
TypeScript database: OK
ESLint: OK
Build backend: OK
Build database: OK
```

## Siguiente decisión

Configurar las variables secretas de ejecución fuera de Git, realizar un smoke test contra PostgreSQL y crear usuarios iniciales de desarrollo mediante un proceso explícito y repetible.
