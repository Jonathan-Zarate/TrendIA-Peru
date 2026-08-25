import type { SessionUser } from '../types'

interface HeaderProps { onHome: () => void, user: SessionUser | null, onLogin: () => void, onLogout: () => void }

const roleNames = { ADMIN: 'Administrador', ANALYST: 'Analista', ENTREPRENEUR: 'Emprendedor' }

export function Header({ onHome, user, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={onHome} aria-label="Ir al inicio de TrendIA Perú">
        <span className="brand-mark" aria-hidden="true">T</span>
        <span><strong>TrendIA</strong><small>Perú</small></span>
      </button>
      <nav aria-label="Navegación principal">
        <button className="nav-link active" type="button" onClick={onHome}>Radar</button>
        <button className="nav-link" type="button" disabled title="Disponible en el siguiente incremento">Mi laboratorio</button>
      </nav>
      {user ? <div className="user-menu"><span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{roleNames[user.role]}</small></span><button type="button" onClick={onLogout}>Salir</button></div> : <button className="login-button" type="button" onClick={onLogin}>Iniciar sesión</button>}
    </header>
  )
}
