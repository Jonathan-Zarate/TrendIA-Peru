# Seguridad y permisos del MVP

## Principio

El frontend puede orientar la experiencia, pero el backend decide cada permiso. El rol nunca se acepta desde el registro público ni se confía únicamente al contenido del JWT.

## Matriz RBAC

| Capacidad | Público | ENTREPRENEUR | ANALYST | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Ver tendencias publicadas | Sí | Sí | Sí | Sí |
| Registrarse e iniciar sesión | Sí | Sí | Sí | Sí |
| Consultar su perfil | No | Sí | Sí | Sí |
| Proponer una idea para analizar | No | Sí | Sí | Sí |
| Consultar sus propios análisis | No | Sí | Sí | Sí |
| Crear y editar tendencias en borrador | No | No | Sí | Sí |
| Registrar fuentes y evaluar oportunidades | No | No | Sí | Sí |
| Enviar una tendencia a revisión | No | No | Sí | Sí |
| Publicar o archivar tendencias | No | No | No | Sí |
| Administrar usuarios y roles | No | No | No | Sí |
| Cambiar la configuración de scoring | No | No | No | Sí |
| Consultar auditoría completa | No | No | No | Sí |

## Reglas de autenticación

- El registro público fuerza el rol `ENTREPRENEUR`.
- Los correos se normalizan a minúsculas antes de persistirlos.
- Las contraseñas nunca se almacenan ni registran en texto plano.
- La respuesta de login usa un mensaje genérico para usuario inexistente, contraseña incorrecta o cuenta inactiva.
- El acceso se bloquea temporalmente después de intentos fallidos consecutivos.
- El JWT de acceso dura pocos minutos y solo identifica la sesión; el backend vuelve a consultar el usuario para aplicar estado y rol actuales.
- Cada solicitud protegida exige `Authorization: Bearer <token>`.
- Las acciones sensibles generan un registro de auditoría.

## Fuera de este incremento

Refresh tokens, recuperación de contraseña, MFA y verificación de correo se incorporarán en incrementos posteriores. No se simularán como si ya existieran.
