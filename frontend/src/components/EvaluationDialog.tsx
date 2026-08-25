import { useEffect, useRef, useState, type FormEvent } from 'react'
import { evaluateTrend, type EvaluationInput } from '../api'
import type { TrendSummary } from '../types'

const criteria = [
  ['internationalGrowth', 'Crecimiento internacional', '¿Qué tan rápido crece fuera del Perú?'],
  ['localInterest', 'Interés local', '¿Qué señales de demanda existen en Perú?'],
  ['competitiveAttractiveness', 'Atractivo competitivo', 'Puntaje alto significa competencia manejable.'],
  ['investmentAccessibility', 'Accesibilidad de inversión', 'Puntaje alto significa menor barrera financiera.'],
  ['implementationEase', 'Facilidad de implementación', 'Tecnología, regulación y operación necesarias.'],
  ['viralPotential', 'Potencial de viralización', 'Capacidad de difusión orgánica y social.'],
] as const

interface EvaluationDialogProps { trend: TrendSummary | null, accessToken: string, onClose: () => void, onCreated: (message: string) => void }

export function EvaluationDialog({ trend, accessToken, onClose, onCreated }: EvaluationDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (trend && !dialog.current?.open) dialog.current?.showModal(); if (!trend && dialog.current?.open) dialog.current.close() }, [trend])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!trend) return; setError(''); setSubmitting(true)
    const data = new FormData(event.currentTarget)
    const input = Object.fromEntries(criteria.map(([key]) => [key, { score: Number(data.get(`${key}.score`)), justification: String(data.get(`${key}.justification`)) }])) as EvaluationInput
    try {
      const result = await evaluateTrend(accessToken, trend.id, input)
      onCreated(`Evaluación guardada: ${result.totalScore}/100 (${result.level}).`)
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar la evaluación.') }
    finally { setSubmitting(false) }
  }

  return <dialog ref={dialog} className="editor-dialog evaluation-dialog" onClose={onClose} onCancel={onClose}><button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button><p className="eyebrow">Índice de oportunidad</p><h2>Evaluar tendencia</h2><p className="dialog-intro">{trend?.title}. Cada nota debe quedar respaldada por una explicación verificable.</p><form onSubmit={submit}>{criteria.map(([key, name, help]) => <fieldset key={key}><legend>{name}</legend><p>{help}</p><div className="criterion-fields"><label>Puntaje<input name={`${key}.score`} type="number" min="0" max="100" defaultValue="50" required /></label><label>Justificación<textarea name={`${key}.justification`} minLength={10} maxLength={1000} rows={2} required /></label></div></fieldset>)}{error && <p className="form-error" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Calculando...' : 'Calcular y guardar índice'}</button></form></dialog>
}
