# ADR-003 — Autenticación propia y RBAC consultado en servidor

**Estado:** Aceptado  
**Fecha:** 2026-08-24

## Contexto

TrendIA necesita servir al futuro frontend web y a una aplicación Android. También debe permitir revocar o cambiar permisos sin esperar a que expire un token antiguo.

## Decisión

El backend emitirá JWT de acceso de corta duración. El token contendrá únicamente identidad y datos estándar de sesión; en cada solicitud protegida se cargará desde PostgreSQL el usuario activo y su rol vigente.

La autorización se expresará con permisos del dominio y una matriz centralizada, no con comparaciones de rol dispersas por los controladores.

La persistencia estará detrás de un puerto `UserRepository`. El adaptador PostgreSQL utilizará Drizzle y los servicios de aplicación dependerán del puerto, lo cual permite probar autenticación y autorización sin una base externa.

## Alternativas descartadas

### Confiar el rol almacenado en el JWT

Reduce una consulta, pero un cambio de rol o una desactivación no tendría efecto hasta que expire el token. Es un riesgo innecesario para el MVP.

### Activar Neon Auth

Resuelve parte de autenticación, pero acopla este incremento al proveedor y no sustituye la autorización del dominio. Se mantiene Neon como PostgreSQL administrado y la API conserva el control de identidad y permisos.

### Sesiones solamente en memoria

No funcionan de manera consistente en despliegues serverless ni entre varias instancias.

## Consecuencias

- Los cambios de rol y la desactivación tienen efecto inmediato.
- Los servicios se pueden probar con repositorios en memoria.
- Cada solicitud protegida agrega una consulta indexada por la clave primaria del usuario.
- Será necesario definir posteriormente rotación de refresh tokens y revocación de sesiones de larga duración.
