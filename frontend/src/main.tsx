import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Catalog } from './components/Catalog'
import { Header } from './components/Header'
import { TrendDetailView } from './components/TrendDetailView'
import './styles.css'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  const navigate = (nextPath: string) => { window.history.pushState({}, '', nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const detailSlug = path.match(/^\/tendencias\/([^/]+)$/)?.[1]
  return <div className="app"><Header onHome={() => navigate('/')} />{detailSlug ? <TrendDetailView slug={decodeURIComponent(detailSlug)} onBack={() => navigate('/')} /> : <Catalog onOpen={(slug) => navigate(`/tendencias/${slug}`)} />}<footer><strong>TrendIA Perú</strong><span>Evidencia global. Decisiones locales.</span></footer></div>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
