interface HeaderProps { onHome: () => void }

export function Header({ onHome }: HeaderProps) {
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
      <button className="login-button" type="button">Iniciar sesión</button>
    </header>
  )
}
