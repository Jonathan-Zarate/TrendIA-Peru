import { useEffect, useState } from 'react'
import { listManagedTrends } from '../api'
import type { TrendPage, UserRole } from '../types'

const statusNames = { DRAFT: 'Borrador', IN_REVIEW: 'En revisión', PUBLISHED: 'Publicada', ARCHIVED: 'Archivada' }

interface ManagementViewProps { accessToken: string, role: UserRole }

export function ManagementView({ accessToken, role }: ManagementViewProps) {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<TrendPage | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setError('')
    listManagedTrends(accessToken, { status, page }, controller.signal)
      .then(setResult)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setError(reason instanceof Error ? reason.message : 'No pudimos abrir la gestión editorial.')
      })
    return () => controller.abort()
  }, [accessToken, page, status])

  return (
    <main className="management-page">
      <section className="management-heading">
        <div><p className="eyebrow">Flujo editorial</p><h1>Gestión de tendencias</h1><p>Revisa el avance y la evidencia antes de convertir una señal en una oportunidad pública.</p></div>
        <button type="button" disabled title="El formulario se incorpora en el siguiente incremento">+ Nueva tendencia</button>
      </section>
      <section className="management-board">
        <div className="management-toolbar">
          <label>Estado<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">Todos</option><option value="DRAFT">Borrador</option><option value="IN_REVIEW">En revisión</option><option value="PUBLISHED">Publicada</option><option value="ARCHIVED">Archivada</option></select></label>
          <span>{role === 'ADMIN' ? 'Puedes revisar y publicar' : 'Puedes preparar y enviar a revisión'}</span>
        </div>
        {error && <div className="state-panel error"><strong>No se pudo cargar el panel.</strong><span>{error}</span></div>}
        {!error && !result && <div className="state-panel"><span className="loader" />Cargando flujo editorial...</div>}
        {!error && result?.data.length === 0 && <div className="state-panel"><strong>No hay tendencias en este estado.</strong><span>Cambia el filtro o crea una nueva señal.</span></div>}
        {!error && result && result.data.length > 0 && <div className="management-table-wrap"><table><thead><tr><th>Tendencia</th><th>Origen</th><th>Estado</th><th>Puntaje</th><th>Publicación</th></tr></thead><tbody>{result.data.map((trend) => <tr key={trend.id}><td><strong>{trend.title}</strong><small>{trend.category.name}</small></td><td>{trend.originCountry}</td><td><span className={`status status-${trend.status.toLowerCase().replace('_', '-')}`}>{statusNames[trend.status]}</span></td><td>{trend.opportunity?.totalScore ?? 'Pendiente'}</td><td>{trend.publishedAt ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(trend.publishedAt)) : '—'}</td></tr>)}</tbody></table></div>}
        {result && result.meta.totalPages > 1 && <nav className="pagination" aria-label="Paginación de gestión"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>Página {page} de {result.meta.totalPages}</span><button type="button" disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></nav>}
      </section>
    </main>
  )
}
