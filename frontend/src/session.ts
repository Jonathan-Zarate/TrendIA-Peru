import type { Session } from './types'

const SESSION_KEY = 'trendia.session'

export function loadSession(): Session | null {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY)
    if (!value) return null
    const session = JSON.parse(value) as Partial<Session>
    if (!session.accessToken || !session.user?.id || !session.user.role) return null
    return session as Session
  }
  catch {
    return null
  }
}

export function saveSession(session: Session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}
