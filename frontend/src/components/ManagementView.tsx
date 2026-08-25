import { useEffect, useState } from 'react'
import { listCategories, listManagedTrends, publishTrend, submitTrendForReview } from '../api'
import type { TrendCategory, TrendPage, TrendSummary, UserRole } from '../types'
import { DraftDialog } from './DraftDialog'
import { SourceDialog } from './SourceDialog'

const statusNames = { DRAFT: 'Borrador', IN_REVIEW: 'En revisión', PUBLISHED: 'Publicada', ARCHIVED: 'Archivada' }

interface ManagementViewProps { accessToken: string, role: UserRole }

export function ManagementView({ accessToken, role }: ManagementViewProps) {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<TrendPage | null>(null)
  const [categories, setCategories] = useState<TrendCategory[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [draftOpen, setDraftOpen] = useState(false)
  const [sourceTrend, setSourceTrend] = useState<TrendSummary | null>(null)
  const [busyId, setBusyId] = useState('')

  useEffect(() => { const controller = new AbortController(); listCategories(controller.signal).then(setCategories).catch(() => setCategories([])); return () => controller.abort() }, [])

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
  }, [accessToken, page, refresh, status])

  const completed = (message: string) => { setNotice(message); setDraftOpen(false); setSourceTrend(null); setRefresh((value) => value + 1) }
  const transition = async (trend: TrendSummary, action: 'review' | 'publish') => {
    setBusyId(trend.id); setError(''); setNotice('')
    try {
      if (action === 'review') await submitTrendForReview(accessToken, trend.id)
      else await publishTrend(accessToken, trend.id)
      completed(action === 'review' ? 'Tendencia enviada a revisión.' : 'Tendencia publicada en el radar.')
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo completar la acción.') }
    finally { setBusyId('') }
  }

  return (
    <main className="management-page">
      <section className="management-heading">
        <div><p className="eyebrow">Flujo editorial</p><h1>Gestión de tendencias</h1><p>Revisa el avance y la evidencia antes de convertir una señal en una oportunidad pública.</p></div>
        <button type="button" onClick={() => setDraftOpen(true)}>+ Nueva tendencia</button>
      </section>
      <section className="management-board">
        <div className="management-toolbar">
          <label>Estado<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">Todos</option><option value="DRAFT">Borrador</option><option value="IN_REVIEW">En revisión</option><option value="PUBLISHED">Publicada</option><option value="ARCHIVED">Archivada</option></select></label>
          <span>{role === 'ADMIN' ? 'Puedes revisar y publicar' : 'Puedes preparar y enviar a revisión'}</span>
        </div>
        {notice && <p className="form-notice" role="status">{notice}</p>}
        {error && <div className="state-panel error"><strong>No se pudo cargar el panel.</strong><span>{error}</span></div>}
        {!error && !result && <div className="state-panel"><span className="loader" />Cargando flujo editorial...</div>}
        {!error && result?.data.length === 0 && <div className="state-panel"><strong>No hay tendencias en este estado.</strong><span>Cambia el filtro o crea una nueva señal.</span></div>}
        {!error && result && result.data.length > 0 && <div className="management-table-wrap"><table><thead><tr><th>Tendencia</th><th>Origen</th><th>Estado</th><th>Puntaje</th><th>Acciones</th></tr></thead><tbody>{result.data.map((trend) => <tr key={trend.id}><td><strong>{trend.title}</strong><small>{trend.category.name}</small></td><td>{trend.originCountry}</td><td><span className={`status status-${trend.status.toLowerCase().replace('_', '-')}`}>{statusNames[trend.status]}</span></td><td>{trend.opportunity?.totalScore ?? 'Pendiente'}</td><td><div className="row-actions">{(trend.status === 'DRAFT' || trend.status === 'IN_REVIEW') && <button type="button" onClick={() => setSourceTrend(trend)}>+ Fuente</button>}{trend.status === 'DRAFT' && <button type="button" disabled={busyId === trend.id} onClick={() => transition(trend, 'review')}>Enviar a revisión</button>}{trend.status === 'IN_REVIEW' && role === 'ADMIN' && <button className="primary" type="button" disabled={busyId === trend.id} onClick={() => transition(trend, 'publish')}>Publicar</button>}</div></td></tr>)}</tbody></table></div>}
        {result && result.meta.totalPages > 1 && <nav className="pagination" aria-label="Paginación de gestión"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>Página {page} de {result.meta.totalPages}</span><button type="button" disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></nav>}
      </section>
      <DraftDialog open={draftOpen} accessToken={accessToken} categories={categories} onClose={() => setDraftOpen(false)} onCreated={() => completed('Borrador creado correctamente.')} />
      <SourceDialog trend={sourceTrend} accessToken={accessToken} onClose={() => setSourceTrend(null)} onCreated={() => completed('Fuente registrada correctamente.')} />
    </main>
  )
}
