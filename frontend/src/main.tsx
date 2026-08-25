import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { getCurrentUser } from './api'
import { Catalog } from './components/Catalog'
import { Header } from './components/Header'
import { LoginDialog } from './components/LoginDialog'
import { TrendDetailView } from './components/TrendDetailView'
import { clearSession, loadSession, saveSession } from './session'
import type { Session } from './types'
import './styles.css'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [loginOpen, setLoginOpen] = useState(false)
  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    getCurrentUser(session.accessToken, controller.signal)
      .then((user) => { const refreshed = { ...session, user }; setSession(refreshed); saveSession(refreshed) })
      .catch(() => { clearSession(); setSession(null) })
    return () => controller.abort()
  }, [session?.accessToken])
  const navigate = (nextPath: string) => { window.history.pushState({}, '', nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const detailSlug = path.match(/^\/tendencias\/([^/]+)$/)?.[1]
  const authenticated = (nextSession: Session) => { saveSession(nextSession); setSession(nextSession); setLoginOpen(false) }
  const logout = () => { clearSession(); setSession(null); navigate('/') }
  return <div className="app"><Header onHome={() => navigate('/')} user={session?.user ?? null} onLogin={() => setLoginOpen(true)} onLogout={logout} />{detailSlug ? <TrendDetailView slug={decodeURIComponent(detailSlug)} onBack={() => navigate('/')} /> : <Catalog onOpen={(slug) => navigate(`/tendencias/${slug}`)} />}<footer><strong>TrendIA Perú</strong><span>Evidencia global. Decisiones locales.</span></footer><LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onAuthenticated={authenticated} /></div>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
