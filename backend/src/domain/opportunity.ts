import { z } from 'zod'

export const opportunityScoreSchema = z.number().int().min(0).max(100)
export const opportunityWeightSchema = z.number().int().min(0).max(100)

export const opportunityCriteriaSchema = z.object({
  internationalGrowth: opportunityScoreSchema,
  localInterest: opportunityScoreSchema,
  competitiveAttractiveness: opportunityScoreSchema,
  investmentAccessibility: opportunityScoreSchema,
  implementationEase: opportunityScoreSchema,
  viralPotential: opportunityScoreSchema,
})

export const opportunityWeightsSchema = z.object({
  internationalGrowth: opportunityWeightSchema,
  localInterest: opportunityWeightSchema,
  competitiveAttractiveness: opportunityWeightSchema,
  investmentAccessibility: opportunityWeightSchema,
  implementationEase: opportunityWeightSchema,
  viralPotential: opportunityWeightSchema,
}).refine(
  (weights) => Object.values(weights).reduce((total, weight) => total + weight, 0) === 100,
  { message: 'Los pesos del indice deben sumar 100.' },
)

export type OpportunityCriteria = z.infer<typeof opportunityCriteriaSchema>
export type OpportunityWeights = z.infer<typeof opportunityWeightsSchema>

export const DEFAULT_OPPORTUNITY_WEIGHTS: OpportunityWeights = {
  internationalGrowth: 20,
  localInterest: 25,
  competitiveAttractiveness: 15,
  investmentAccessibility: 10,
  implementationEase: 15,
  viralPotential: 15,
}

export type OpportunityLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface OpportunityResult {
  score: number
  level: OpportunityLevel
}

export function calculateOpportunity(
  criteriaInput: OpportunityCriteria,
  weightsInput: OpportunityWeights = DEFAULT_OPPORTUNITY_WEIGHTS,
): OpportunityResult {
  const criteria = opportunityCriteriaSchema.parse(criteriaInput)
  const weights = opportunityWeightsSchema.parse(weightsInput)

  const weightedTotal = (
    criteria.internationalGrowth * weights.internationalGrowth
    + criteria.localInterest * weights.localInterest
    + criteria.competitiveAttractiveness * weights.competitiveAttractiveness
    + criteria.investmentAccessibility * weights.investmentAccessibility
    + criteria.implementationEase * weights.implementationEase
    + criteria.viralPotential * weights.viralPotential
  ) / 100

  const score = Math.round((weightedTotal + Number.EPSILON) * 100) / 100
  const level: OpportunityLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW'

  return { score, level }
}

