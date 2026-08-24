# ADR-001: Arquitectura web-first en un monorepo TypeScript

- Estado: aceptada
- Fecha: 2026-08-24

## Contexto

El proyecto parte desde cero y debe presentar un MVP funcional el 29 de agosto. También pretende servir como portafolio y base de un producto comercial. La propuesta inicial incluía React o Angular, Flutter, Spring Boot, Python, PostgreSQL y Power BI, pero adoptar todas esas tecnologías antes de validar el flujo principal aumentaría el riesgo sin mejorar la demostración.

## Decisión

1. Usar un monorepo administrado con pnpm.
2. Construir el frontend con React, TypeScript y Vite.
3. Construir una API REST con Hono y TypeScript.
4. Usar PostgreSQL en Neon y migraciones versionadas con Drizzle.
5. Mantener un monolito modular con límites por dominio; no crear microservicios inicialmente.
6. Encapsular el proveedor de IA detrás de una interfaz para permitir sustitución, pruebas y modo simulado.
7. Desplegar frontend y API como proyectos separados en Vercel.
8. Diseñar la API para una futura aplicación nativa creada en Android Studio.

## Consecuencias positivas

- Un lenguaje compartido reduce el tiempo de entrega y errores de contrato.
- El flujo completo puede desplegarse con poca infraestructura.
- La API sigue siendo independiente del frontend y reutilizable por Android.
- Neon aporta PostgreSQL administrado sin abandonar restricciones, transacciones e índices.
- La IA puede desactivarse o simularse durante pruebas.

## Costos y límites

- Hono ofrece menos estructura impuesta que Spring Boot; el proyecto debe hacer explícitos sus módulos y dependencias.
- Vercel es serverless; los trabajos largos o programados requerirán otra estrategia futura.
- TypeScript no sustituye validaciones de runtime ni restricciones en PostgreSQL.
- La aplicación Android se construirá después del MVP web.

## Alternativas descartadas por ahora

- Spring Boot: sólido, pero añade tiempo de configuración y un segundo ecosistema para un plazo de cinco días.
- Servicio Python separado: se incorporará solo si aparece una necesidad real de procesamiento que no convenga resolver mediante API.
- Flutter: descartado porque la decisión futura es Android Studio.
- Next.js monolítico: se prefiere separar claramente SPA y API para reutilizar el backend desde Android.

## Revisión

La decisión se revisará después de la presentación con métricas del MVP, requisitos de ingestión automática y necesidades reales de procesamiento asíncrono.

