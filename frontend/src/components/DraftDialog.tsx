import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createTrend } from '../api'
import type { TrendCategory } from '../types'

interface DraftDialogProps { open: boolean, accessToken: string, categories: TrendCategory[], onClose: () => void, onCreated: () => void }

export function DraftDialog({ open, accessToken, categories, onClose, onCreated }: DraftDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (open && !dialog.current?.open) dialog.current?.showModal(); if (!open && dialog.current?.open) dialog.current.close() }, [open])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSubmitting(true)
    const data = new FormData(event.currentTarget)
    try {
      await createTrend(accessToken, {
        categoryId: String(data.get('categoryId')),
        title: String(data.get('title')),
        summary: String(data.get('summary')),
        originCountry: String(data.get('originCountry')).toUpperCase(),
        ...(data.get('originRegion') ? { originRegion: String(data.get('originRegion')) } : {}),
        ...(data.get('observationStartedAt') ? { observationStartedAt: String(data.get('observationStartedAt')) } : {}),
        ...(data.get('observationEndedAt') ? { observationEndedAt: String(data.get('observationEndedAt')) } : {}),
      })
      event.currentTarget.reset(); onCreated()
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo crear el borrador.') }
    finally { setSubmitting(false) }
  }

  return <dialog ref={dialog} className="editor-dialog" onClose={onClose} onCancel={onClose}><button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button><p className="eyebrow">Nueva señal</p><h2>Crear tendencia</h2><p className="dialog-intro">Registra primero la hipótesis. La publicación exigirá evidencia.</p><form onSubmit={submit}><label>Categoría<select name="categoryId" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Título<input name="title" minLength={3} maxLength={220} required /></label><label>Resumen<textarea name="summary" minLength={20} maxLength={2000} rows={4} required /></label><div className="form-columns"><label>País de origen (ISO)<input name="originCountry" minLength={2} maxLength={2} placeholder="KR" required /></label><label>Región (opcional)<input name="originRegion" maxLength={120} /></label></div><div className="form-columns"><label>Observación desde<input name="observationStartedAt" type="date" /></label><label>Observación hasta<input name="observationEndedAt" type="date" /></label></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={submitting || categories.length === 0}>{submitting ? 'Guardando...' : 'Guardar borrador'}</button></form></dialog>
}
