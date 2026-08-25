# ADR-002: Índice de oportunidad versionado y explicable

- Estado: aceptada de forma provisional para el MVP
- Fecha: 2026-08-24

## Contexto

TrendIA necesita ordenar oportunidades sin presentar una predicción falsa de éxito. Un único número opaco sería fácil de mostrar, pero difícil de defender, corregir o auditar.

## Decisión

El índice será un promedio ponderado de seis criterios normalizados de 0 a 100:

| Criterio | Peso inicial |
|---|---:|
| Crecimiento internacional | 20 |
| Interés local en Perú | 25 |
| Atractivo competitivo | 15 |
| Accesibilidad de inversión | 10 |
| Facilidad de implementación | 15 |
| Potencial de viralización | 15 |
| Total | 100 |

```text
índice = Σ(puntuación del criterio × peso del criterio) / 100
```

Cada puntuación requiere una justificación. La configuración y su versión se guardan junto con la evaluación.

## Interpretación inicial

- 0 a 39: oportunidad baja.
- 40 a 69: oportunidad media; requiere validar supuestos críticos.
- 70 a 100: oportunidad alta; sigue necesitando validación real.

Las etiquetas no son probabilidades de éxito ni recomendaciones financieras.

## Responsabilidad de cálculo

- El dominio calcula el índice antes de persistir.
- La API nunca acepta un total arbitrario enviado por el navegador.
- PostgreSQL verifica rangos, suma de pesos y coherencia del total almacenado.
- Las pruebas cubrirán fronteras, redondeo y configuraciones inválidas.

## Consecuencias

- El usuario puede entender por qué una oportunidad obtuvo su posición.
- Los pesos pueden evolucionar sin reescribir el pasado.
- Comparar evaluaciones exige considerar categoría y versión de configuración.
- Los pesos iniciales son una hipótesis que debe validarse con usuarios y datos reales.

## Alternativas descartadas

- Puntuación generada libremente por un modelo de lenguaje: no reproducible ni auditable.
- Un promedio sin pesos: ignora la prioridad inicial del interés local.
- Un modelo predictivo entrenado: no existe todavía un conjunto de resultados históricos suficiente.

