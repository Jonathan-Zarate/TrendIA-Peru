import { useEffect, useState } from 'react'
import { getTrend } from '../api'
import type { TrendDetail } from '../types'

const countries: Record<string, string> = { CN: 'China', JP: 'Japón', KR: 'Corea del Sur', SG: 'Singapur', US: 'Estados Unidos' }

interface TrendDetailViewProps { slug: string, onBack: () => void }

export function TrendDetailView({ slug, onBack }: TrendDetailViewProps) {
  const [trend, setTrend] = useState<TrendDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setTrend(null)
    setError('')
    getTrend(slug, controller.signal)
      .then(setTrend)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setError(reason instanceof Error ? reason.message : 'No pudimos abrir esta oportunidad.')
      })
    return () => controller.abort()
  }, [slug])

  if (error) return <main className="detail-state"><strong>No pudimos abrir esta tendencia.</strong><span>{error}</span><button type="button" onClick={onBack}>Volver al radar</button></main>
  if (!trend) return <main className="detail-state" role="status"><span className="loader" />Preparando la oportunidad...</main>

  return (
    <main className="detail-page">
      <button className="back-button" type="button" onClick={onBack}>← Volver al radar</button>
      <section className="detail-hero">
        <div>
          <div className="detail-tags"><span>{trend.category.name}</span><span>{countries[trend.originCountry] ?? trend.originCountry}{trend.originRegion ? ` · ${trend.originRegion}` : ''}</span></div>
          <h1>{trend.title}</h1>
          <p>{trend.summary}</p>
        </div>
        <aside className="opportunity-panel">
          <small>Índice de oportunidad</small>
          {trend.opportunity ? <><strong>{trend.opportunity.totalScore}<span>/100</span></strong><p>Potencial {trend.opportunity.level === 'HIGH' ? 'alto' : trend.opportunity.level === 'MEDIUM' ? 'medio' : 'inicial'} para Perú</p></> : <p>Evaluación en preparación</p>}
        </aside>
      </section>
      <section className="detail-grid">
        <article className="detail-block">
          <p className="eyebrow">Evidencia</p><h2>Fuentes que respaldan la señal</h2>
          {trend.sources.length === 0 ? <p className="muted">Todavía no se han publicado fuentes.</p> : <div className="source-list">{trend.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{source.type.replaceAll('_', ' ')}</span><strong>{source.title}</strong><p>{source.evidenceNote}</p><small>{source.publisher ?? 'Fuente pública'} · consultada el {formatDate(source.consultedAt)}</small></a>)}</div>}
        </article>
        <aside className="observation-card">
          <p className="eyebrow">Trazabilidad</p><h3>Periodo observado</h3>
          <dl><div><dt>Inicio</dt><dd>{formatDate(trend.observationStartedAt)}</dd></div><div><dt>Fin</dt><dd>{formatDate(trend.observationEndedAt)}</dd></div><div><dt>Publicación</dt><dd>{formatDate(trend.publishedAt)}</dd></div></dl>
          <p>El puntaje resume evidencia disponible; no garantiza el éxito comercial. La validación local sigue siendo necesaria.</p>
        </aside>
      </section>
    </main>
  )
}

function formatDate(value: string | null) {
  if (!value) return 'No especificado'
  const [date] = value.split('T')
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}
