import type { TrendSummary } from '../types'

const countries: Record<string, string> = { CN: 'China', JP: 'Japón', KR: 'Corea del Sur', SG: 'Singapur', US: 'Estados Unidos' }
const levels = { HIGH: 'Potencial alto', MEDIUM: 'Potencial medio', LOW: 'Potencial inicial' }

interface TrendCardProps { trend: TrendSummary, onOpen: (slug: string) => void }

export function TrendCard({ trend, onOpen }: TrendCardProps) {
  return (
    <article className="trend-card">
      <div className="card-topline">
        <span className="category-chip">{trend.category.name}</span>
        <span className="country">{countries[trend.originCountry] ?? trend.originCountry}</span>
      </div>
      <div><h3>{trend.title}</h3><p>{trend.summary}</p></div>
      <div className="score-row">
        {trend.opportunity ? (
          <div className={`score score-${trend.opportunity.level.toLowerCase()}`}>
            <strong>{trend.opportunity.totalScore}</strong><span>{levels[trend.opportunity.level]}</span>
          </div>
        ) : <span className="pending-score">Evaluación en preparación</span>}
        <button type="button" className="text-button" onClick={() => onOpen(trend.slug)}>Ver oportunidad <span aria-hidden="true">→</span></button>
      </div>
    </article>
  )
}
