# Modelo de dominio — núcleo del MVP

## Foco inicial

La primera versión valida tendencias de tecnología y negocios de consumo. El sistema conserva un catálogo de categorías para expandirse después, pero no mezclará configuraciones de puntuación sin indicar su categoría y versión.

## Agregados principales

### Tendencia

Representa una señal internacional que merece investigación, no una oportunidad confirmada.

- Título y resumen.
- País y región de origen.
- Categoría.
- Estado editorial: borrador, en revisión, publicada o archivada.
- Ventana temporal observada.
- Usuario responsable.
- Una o más fuentes verificables.

Reglas:

- Una tendencia no puede publicarse sin al menos una fuente activa.
- Archivar conserva fuentes, evaluaciones y análisis.
- El país se almacena con código ISO 3166-1 alfa-2.

### Fuente de tendencia

Registra de dónde procede una afirmación usada para describir o puntuar la tendencia.

- Tipo: datos abiertos, buscador, artículo, investigación, encuesta u otro.
- URL y título.
- Organización responsable.
- Fecha de publicación, cuando exista.
- Fecha de consulta obligatoria.
- Nota sobre el dato o señal utilizada.

La URL no prueba por sí sola la calidad de la evidencia. El analista debe indicar qué dato tomó de ella.

### Configuración del índice

Versiona los pesos usados para calcular oportunidades dentro de una categoría.

- Nombre y versión.
- Categoría aplicable.
- Seis pesos enteros cuya suma debe ser 100.
- Estado activo o inactivo.

No se editan evaluaciones históricas al cambiar los pesos. Una nueva configuración genera una nueva versión.

### Evaluación de oportunidad

Es una fotografía explicable de la oportunidad estimada de una tendencia en Perú.

- Seis puntuaciones de 0 a 100.
- Índice total de 0 a 100.
- Configuración utilizada.
- Justificación de cada criterio.
- Autor y fecha.

Los criterios son:

1. Crecimiento internacional.
2. Interés local.
3. Atractivo competitivo: puntúa alto cuando la competencia deja espacio razonable.
4. Accesibilidad de inversión: puntúa alto cuando la inversión es más abordable.
5. Facilidad de implementación.
6. Potencial de viralización.

Nombrar los criterios 3 y 4 en sentido positivo evita fórmulas implícitas donde un valor alto podría significar algo bueno o malo según el campo.

### Análisis para Perú

Propuesta estructurada generada o asistida por IA y revisada por una persona.

- Público objetivo.
- Problema atendido.
- Adaptación local.
- Modelo de ingresos.
- Riesgos.
- MVP recomendado.
- Preguntas sugeridas para validación.
- Proveedor, modelo y versión del prompt.
- Estado: generado, revisado, aprobado o rechazado.
- Revisor y fecha de revisión.

Reglas:

- La IA nunca publica directamente.
- La salida se conserva como datos estructurados y también como respuesta original para auditoría.
- Una aprobación exige revisor humano.

## Roles iniciales

| Acción | ADMIN | ANALYST | ENTREPRENEUR |
|---|---:|---:|---:|
| Gestionar usuarios y parámetros | Sí | No | No |
| Crear y editar tendencias | Sí | Sí | No |
| Publicar tendencias | Sí | Sí | No |
| Crear evaluaciones | Sí | Sí | No |
| Generar análisis | Sí | Sí | Sí |
| Aprobar análisis editorial | Sí | Sí | No |
| Explorar y crear validaciones | Sí | Sí | Sí |

La API decide la autorización. La interfaz puede ocultar o deshabilitar acciones, pero no constituye la barrera de seguridad.

