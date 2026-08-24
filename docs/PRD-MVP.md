# PRD — MVP de TrendIA Perú

## Objetivo

Construir una aplicación web que permita registrar una tendencia internacional, estimar de forma explicable su oportunidad en Perú, generar una adaptación asistida por IA y validar la propuesta mediante una encuesta.

## Fecha objetivo

Presentación: sábado 29 de agosto de 2026.

## Resultado demostrable

Durante la presentación, un usuario debe poder completar este recorrido:

1. Iniciar sesión.
2. Explorar y filtrar tendencias.
3. Abrir una tendencia y revisar sus fuentes.
4. Consultar el desglose de su índice de oportunidad.
5. Generar o revisar un análisis para Perú.
6. Crear y publicar una encuesta asociada.
7. Registrar respuestas de prueba.
8. Consultar resultados segmentados.
9. Descargar un reporte.

## Requisitos funcionales prioritarios

### RF-01 Autenticación y roles

- Inicio y cierre de sesión.
- Roles `ADMIN`, `ANALYST` y `ENTREPRENEUR`.
- Las decisiones de autorización se aplican en la API.

### RF-02 Catálogo de tendencias

- Crear, revisar, publicar y consultar tendencias.
- Filtrar por texto, región de origen, categoría y estado.
- Registrar al menos una fuente con URL, fecha y tipo.

### RF-03 Índice de oportunidad

- Componentes: crecimiento internacional, interés local, competencia, inversión, facilidad y viralización.
- Cada componente se representa de 0 a 100.
- Pesos versionados y configurables.
- Resultado y desglose persistidos para auditoría.
- No se permite guardar una puntuación fuera del rango.

### RF-04 Análisis asistido por IA

- Generar público objetivo, problema, adaptación local, modelo de ingresos, riesgos, MVP y preguntas de encuesta.
- Conservar proveedor, modelo, versión del prompt, fecha y respuesta estructurada.
- Permitir revisión humana antes de publicar.
- Mostrar que el contenido es una estimación, no una garantía.

### RF-05 Encuestas

- Crear una encuesta a partir de un análisis.
- Publicarla mediante un enlace público.
- Aceptar respuestas sin cuenta.
- Aplicar controles básicos contra duplicados y abuso.
- Mostrar totales y segmentación inicial por ciudad.

### RF-06 Reporte

- Resumir tendencia, fuentes, puntuación, análisis y resultados.
- Descargar un reporte reproducible desde datos persistidos.

### RF-07 Auditoría

- Registrar actor, acción, entidad, fecha y datos esenciales de cambios críticos.

## Requisitos no funcionales

- Validación de entrada en todos los endpoints mutables.
- Contraseñas almacenadas únicamente como hash robusto.
- Secretos fuera del repositorio.
- Respuestas paginadas para listados.
- Errores con formato consistente y `requestId`.
- Pruebas unitarias, de integración y smoke de producción.
- CI con test, tipos, lint y build.
- Accesibilidad básica por teclado, etiquetas y contraste.

## Fuera del alcance del MVP

- Aplicación Android.
- Extracción automática desde TikTok, Instagram u otras fuentes restringidas.
- Mapa geográfico avanzado.
- Alertas automáticas.
- Kanban de seguimiento.
- Marketplace o pagos.
- Predicciones que se presenten como certezas estadísticas.

## Criterio de terminado

Una funcionalidad se considera terminada cuando tiene regla documentada, autorización en servidor, persistencia real, pruebas proporcionales al riesgo, estado de error visible y evidencia de funcionamiento en producción.

