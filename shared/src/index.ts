import { z } from 'zod'

// Los clientes comparten rangos y formas de datos, pero el servidor conserva la formula de negocio.
export const opportunityScoreSchema = z.number().int().min(0).max(100)
