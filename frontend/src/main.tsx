import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">TrendIA Perú</p>
        <h1 id="page-title">Tendencias globales, oportunidades locales.</h1>
        <p className="summary">
          Estamos construyendo una plataforma para evaluar tendencias internacionales con evidencia,
          contexto peruano y validación de usuarios reales.
        </p>
        <div className="flow" aria-label="Flujo principal del producto">
          <span>Detectar</span><strong aria-hidden="true">→</strong>
          <span>Evaluar</span><strong aria-hidden="true">→</strong>
          <span>Validar</span><strong aria-hidden="true">→</strong>
          <span>Construir</span>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

