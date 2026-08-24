import { z } from 'zod'

export const opportunityScoreSchema = z.number().int().min(0).max(100)

