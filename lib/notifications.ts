import type { BigMoment } from './events'

const CROWD_CHEER_SRC = '/sounds/crowd-cheer.mp3'
const ALERT_SOUND_MAX_SECONDS = 3
const ALERT_SOUND_STORAGE_KEY = 'switcheroo-alert-sound-enabled'

let audioContext: AudioContext | null = null
let crowdBuffer: AudioBuffer | null = null
let loadPromise: Promise<AudioBuffer | null> | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!audioContext) audioContext = new AudioCtx()
  return audioContext
}

async function loadCrowdBuffer(): Promise<AudioBuffer | null> {
  if (crowdBuffer) return crowdBuffer
  if (loadPromise) return loadPromise

  const ctx = getAudioContext()
  if (!ctx) return null

  loadPromise = fetch(CROWD_CHEER_SRC)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load alert sound')
      return res.arrayBuffer()
    })
    .then((data) => ctx.decodeAudioData(data))
    .then((buffer) => {
      crowdBuffer = buffer
      return buffer
    })
    .catch(() => null)

  return loadPromise
}

export function getAlertSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(ALERT_SOUND_STORAGE_KEY)
  if (stored === null) return true
  return stored === 'true'
}

export function setAlertSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ALERT_SOUND_STORAGE_KEY, String(enabled))
}

export function preloadAlertSound(): void {
  if (!getAlertSoundEnabled()) return
  void loadCrowdBuffer()
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function getNotificationPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function fireBrowserNotification(moment: BigMoment): void {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  new Notification('LOOK AT YOUR SCREEN NOW', {
    body: moment.subtext,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: moment.eventKey,
    requireInteraction: true,
    silent: false,
  })
}

export function playAlertSound(_level?: string): void {
  if (typeof window === 'undefined') return
  if (!getAlertSoundEnabled()) return

  void loadCrowdBuffer().then((buffer) => {
    if (!buffer) return

    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gain = ctx.createGain()
    const playDuration = Math.min(ALERT_SOUND_MAX_SECONDS, buffer.duration)
    const now = ctx.currentTime

    // Sharp hit: fast attack, hard stop at 3s.
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(1.35, now + 0.02)
    gain.gain.setValueAtTime(1.35, now + playDuration - 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + playDuration)

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start(0, 0, playDuration)
  })
}
