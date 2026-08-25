import { useEffect, useState } from 'react'
import { listTrends } from '../api'
import type { TrendPage } from '../types'
import { TrendCard } from './TrendCard'

interface CatalogProps { onOpen: (slug: string) => void }

export function Catalog({ onOpen }: CatalogProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [country, setCountry] = useState('')
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<TrendPage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedQuery(query.trim()); setPage(1) }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    listTrends({ query: debouncedQuery, originCountry: country, page, limit: 6 }, controller.signal)
      .then(setResult)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setError(reason instanceof Error ? reason.message : 'No pudimos cargar las tendencias.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [debouncedQuery, country, page, retry])

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Radar de oportunidades</p>
          <h1>Lo que crece afuera,<br /><em>adaptado al Perú.</em></h1>
          <p>Descubre tendencias internacionales respaldadas por evidencia y entiende dónde existe una oportunidad real en el mercado peruano.</p>
        </div>
        <div className="hero-metric" aria-label="Proceso de evaluación">
          <span>01</span><p>Detectamos señales globales</p><span>02</span><p>Contrastamos interés local</p><span>03</span><p>Explicamos la oportunidad</p>
        </div>
      </section>
      <section className="catalog" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div><p className="eyebrow">Explorar</p><h2 id="catalog-title">Tendencias publicadas</h2></div>
          {result && <p className="result-count">{result.meta.total} oportunidades encontradas</p>}
        </div>
        <div className="filters">
          <label className="search-field"><span className="sr-only">Buscar tendencias</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o problema..." /></label>
          <label><span className="sr-only">Filtrar por país de origen</span><select value={country} onChange={(event) => { setCountry(event.target.value); setPage(1) }}><option value="">Todos los países</option><option value="KR">Corea del Sur</option><option value="JP">Japón</option><option value="CN">China</option><option value="SG">Singapur</option><option value="US">Estados Unidos</option></select></label>
        </div>
        {loading && <div className="state-panel" role="status"><span className="loader" />Analizando el radar...</div>}
        {!loading && error && <div className="state-panel error"><strong>No se pudo cargar el radar.</strong><span>{error}</span><button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div>}
        {!loading && !error && result?.data.length === 0 && <div className="state-panel"><strong>No encontramos coincidencias.</strong><span>Prueba con otra palabra o limpia los filtros.</span></div>}
        {!loading && !error && result && result.data.length > 0 && <><div className="trend-grid">{result.data.map((trend) => <TrendCard key={trend.id} trend={trend} onOpen={onOpen} />)}</div>{result.meta.totalPages > 1 && <nav className="pagination" aria-label="Paginación del catálogo"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>Página {page} de {result.meta.totalPages}</span><button type="button" disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></nav>}</>}
      </section>
    </main>
  )
}
