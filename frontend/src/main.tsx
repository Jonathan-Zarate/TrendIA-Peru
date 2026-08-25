import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Catalog } from './components/Catalog'
import { Header } from './components/Header'
import './styles.css'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  const navigate = (nextPath: string) => { window.history.pushState({}, '', nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return <div className="app"><Header onHome={() => navigate('/')} /><Catalog onOpen={(slug) => navigate(`/tendencias/${slug}`)} /><footer><strong>TrendIA Perú</strong><span>Evidencia global. Decisiones locales.</span><small>Ruta actual: {path}</small></footer></div>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
