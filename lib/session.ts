import type { Fixture } from './api'
import { findServiceById, type StreamingService } from './services'

export type SetupStep = 1 | 2 | 3

export type StoredWatchSession = {
  version: 1
  activeStep: SetupStep
  fixture: Fixture
  serviceId: string
  delaySeconds: number
  headsUpSeconds: number
}

const SESSION_KEY = 'switcheroo-watch-session'

export function saveWatchSession(session: Omit<StoredWatchSession, 'version'>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: StoredWatchSession = { version: 1, ...session }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
  } catch {
    // Storage full or unavailable
  }
}

export function loadWatchSession(): StoredWatchSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredWatchSession
    if (parsed.version !== 1 || !parsed.fixture?.fixture?.id || !parsed.serviceId) return null
    if (!findServiceById(parsed.serviceId)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearWatchSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}

export function resolveSessionService(serviceId: string): StreamingService | null {
  return findServiceById(serviceId)
}
