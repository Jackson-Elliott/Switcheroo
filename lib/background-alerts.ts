export const BACKGROUND_ALERTS_DISMISS_KEY = 'switcheroo-background-alerts-dismissed'
export const STEP3_INTRO_SEEN_KEY = 'switcheroo-step3-intro-seen'
export const BACKGROUND_ALERTS_CHANGE_EVENT = 'switcheroo-background-alerts-change'

export function isBackgroundAlertsDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(BACKGROUND_ALERTS_DISMISS_KEY) === 'true'
}

export function hasSeenStep3Intro(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STEP3_INTRO_SEEN_KEY) === 'true'
}

export function markStep3IntroSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STEP3_INTRO_SEEN_KEY, 'true')
  window.dispatchEvent(new CustomEvent(BACKGROUND_ALERTS_CHANGE_EVENT))
}

export function dismissBackgroundAlerts(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BACKGROUND_ALERTS_DISMISS_KEY, 'true')
  window.dispatchEvent(new CustomEvent(BACKGROUND_ALERTS_CHANGE_EVENT))
}

export function restoreBackgroundAlerts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(BACKGROUND_ALERTS_DISMISS_KEY)
  window.dispatchEvent(new CustomEvent(BACKGROUND_ALERTS_CHANGE_EVENT))
}

export function subscribeBackgroundAlertsChange(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(BACKGROUND_ALERTS_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(BACKGROUND_ALERTS_CHANGE_EVENT, onChange)
}
