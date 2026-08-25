import { useEffect, useRef, useState, type FormEvent } from 'react'
import { addTrendSource } from '../api'
import type { TrendSummary } from '../types'

interface SourceDialogProps { trend: TrendSummary | null, accessToken: string, onClose: () => void, onCreated: () => void }

export function SourceDialog({ trend, accessToken, onClose, onCreated }: SourceDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (trend && !dialog.current?.open) dialog.current?.showModal(); if (!trend && dialog.current?.open) dialog.current.close() }, [trend])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!trend) return; setError(''); setSubmitting(true)
    const data = new FormData(event.currentTarget)
    try {
      await addTrendSource(accessToken, trend.id, { type: String(data.get('type')), title: String(data.get('title')), url: String(data.get('url')), ...(data.get('publisher') ? { publisher: String(data.get('publisher')) } : {}), ...(data.get('publishedAt') ? { publishedAt: String(data.get('publishedAt')) } : {}), consultedAt: String(data.get('consultedAt')), evidenceNote: String(data.get('evidenceNote')) })
      event.currentTarget.reset(); onCreated()
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo registrar la fuente.') }
    finally { setSubmitting(false) }
  }

  return <dialog ref={dialog} className="editor-dialog" onClose={onClose} onCancel={onClose}><button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button><p className="eyebrow">Evidencia</p><h2>Agregar fuente</h2><p className="dialog-intro">{trend?.title}</p><form onSubmit={submit}><label>Tipo<select name="type" required><option value="OPEN_DATA">Datos abiertos</option><option value="SEARCH_TRENDS">Tendencias de búsqueda</option><option value="ARTICLE">Artículo</option><option value="RESEARCH">Investigación</option><option value="SURVEY">Encuesta</option><option value="OTHER">Otra</option></select></label><label>Título<input name="title" minLength={3} maxLength={300} required /></label><label>URL<input name="url" type="url" required /></label><div className="form-columns"><label>Publicador<input name="publisher" /></label><label>Fecha de publicación<input name="publishedAt" type="date" /></label></div><label>Fecha de consulta<input name="consultedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><label>¿Qué demuestra esta fuente?<textarea name="evidenceNote" minLength={10} maxLength={2000} rows={4} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Registrar evidencia'}</button></form></dialog>
}
