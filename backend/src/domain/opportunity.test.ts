import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import {
  calculateOpportunity,
  DEFAULT_OPPORTUNITY_WEIGHTS,
  type OpportunityCriteria,
} from './opportunity.js'

const criteria = (score: number): OpportunityCriteria => ({
  internationalGrowth: score,
  localInterest: score,
  competitiveAttractiveness: score,
  investmentAccessibility: score,
  implementationEase: score,
  viralPotential: score,
})

describe('calculateOpportunity', () => {
  it.each([
    [0, 'LOW'],
    [39, 'LOW'],
    [40, 'MEDIUM'],
    [69, 'MEDIUM'],
    [70, 'HIGH'],
    [100, 'HIGH'],
  ] as const)('clasifica correctamente la frontera %i', (score, level) => {
    expect(calculateOpportunity(criteria(score))).toEqual({ score, level })
  })

  it('aplica los pesos versionables y redondea a dos decimales', () => {
    expect(calculateOpportunity({
      internationalGrowth: 80,
      localInterest: 70,
      competitiveAttractiveness: 60,
      investmentAccessibility: 50,
      implementationEase: 40,
      viralPotential: 30,
    })).toEqual({ score: 58, level: 'MEDIUM' })
  })

  it('rechaza puntuaciones fuera del rango', () => {
    expect(() => calculateOpportunity({ ...criteria(50), localInterest: 101 })).toThrow(ZodError)
  })

  it('rechaza configuraciones que no suman 100', () => {
    expect(() => calculateOpportunity(criteria(50), {
      ...DEFAULT_OPPORTUNITY_WEIGHTS,
      localInterest: 24,
    })).toThrow('Los pesos del indice deben sumar 100.')
  })
})

