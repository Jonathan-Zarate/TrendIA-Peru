import { useEffect, useRef, useState, type FormEvent } from 'react'
import { login } from '../api'
import type { Session } from '../types'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  onAuthenticated: (session: Session) => void
}

export function LoginDialog({ open, onClose, onAuthenticated }: LoginDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const node = dialog.current
    if (open && !node?.open) node?.showModal()
    if (!open && node?.open) node.close()
  }, [open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const session = await login(email.trim(), password)
      onAuthenticated(session)
      setPassword('')
    }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos iniciar sesión.')
    }
    finally { setSubmitting(false) }
  }

  return (
    <dialog ref={dialog} className="login-dialog" onClose={onClose} onCancel={onClose}>
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
      <p className="eyebrow">Acceso seguro</p>
      <h2>Bienvenido a TrendIA</h2>
      <p className="dialog-intro">Ingresa para gestionar tendencias o continuar con tus oportunidades.</p>
      <form onSubmit={submit}>
        <label>Correo electrónico<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" /></label>
        <label>Contraseña<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? 'Ocultar' : 'Ver'}</button></span></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Verificando...' : 'Iniciar sesión'}</button>
      </form>
      <small>El acceso se bloquea temporalmente después de cinco intentos fallidos.</small>
    </dialog>
  )
}
