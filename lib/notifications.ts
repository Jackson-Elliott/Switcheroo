import {
  ALERT_NOTIFICATION_TITLE,
  ALERT_SUBTEXT,
  type BigMoment,
} from './events'

const ALERT_SOUND_SRCS = [
  '/sounds/crowd-cheer.mp3',
  '/sounds/crowd-cheer-462.wav',
  '/sounds/crowd-cheer-3022.wav',
  '/sounds/crowd-cheer-2111.wav',
] as const

const ALERT_SOUND_MAX_SECONDS = 3
const ALERT_SOUND_STORAGE_KEY = 'switcheroo-alert-sound-enabled'
const ALERT_SOUND_TYPE_STORAGE_KEY = 'switcheroo-alert-sound-type'

export type AlertSoundType = 'crowd' | 'ding'

const DING_SEQUENCE = [880, 1100, 880, 1100] as const

let audioContext: AudioContext | null = null
const crowdBuffers: Array<AudioBuffer | null> = ALERT_SOUND_SRCS.map(() => null)
let loadPromise: Promise<AudioBuffer[]> | null = null
let lastPlayedIndex = -1

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!audioContext) audioContext = new AudioCtx()
  return audioContext
}

async function loadSingleCrowdBuffer(src: string, index: number): Promise<AudioBuffer | null> {
  const ctx = getAudioContext()
  if (!ctx) return null

  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`Failed to load alert sound: ${src}`)
    const data = await res.arrayBuffer()
    const buffer = await ctx.decodeAudioData(data)
    crowdBuffers[index] = buffer
    return buffer
  } catch {
    return null
  }
}

async function loadCrowdBuffers(): Promise<AudioBuffer[]> {
  const loaded = crowdBuffers.filter((buffer): buffer is AudioBuffer => buffer !== null)
  if (loaded.length === ALERT_SOUND_SRCS.length) return loaded
  if (loadPromise) return loadPromise

  loadPromise = Promise.all(
    ALERT_SOUND_SRCS.map((src, index) => loadSingleCrowdBuffer(src, index))
  ).then((buffers) => buffers.filter((buffer): buffer is AudioBuffer => buffer !== null))

  return loadPromise
}

function pickCrowdBuffer(buffers: AudioBuffer[]): AudioBuffer | null {
  if (buffers.length === 0) return null
  if (buffers.length === 1) return buffers[0]

  let index = Math.floor(Math.random() * buffers.length)
  if (index === lastPlayedIndex) {
    index = (index + 1 + Math.floor(Math.random() * (buffers.length - 1))) % buffers.length
  }
  lastPlayedIndex = index
  return buffers[index]
}

function playCrowdBuffer(buffer: AudioBuffer): void {
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

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.exponentialRampToValueAtTime(1.35, now + 0.02)
  gain.gain.setValueAtTime(1.35, now + playDuration - 0.08)
  gain.gain.exponentialRampToValueAtTime(0.001, now + playDuration)

  source.connect(gain)
  gain.connect(ctx.destination)
  source.start(0, 0, playDuration)
}

function playDingSound(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  let startTime = ctx.currentTime

  for (const freq of DING_SEQUENCE) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
    osc.start(startTime)
    osc.stop(startTime + 0.3)
    startTime += 0.25
  }
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

export function getAlertSoundType(): AlertSoundType {
  if (typeof window === 'undefined') return 'crowd'
  const stored = localStorage.getItem(ALERT_SOUND_TYPE_STORAGE_KEY)
  return stored === 'ding' ? 'ding' : 'crowd'
}

export function setAlertSoundType(type: AlertSoundType): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ALERT_SOUND_TYPE_STORAGE_KEY, type)
}

export function preloadAlertSound(): void {
  if (!getAlertSoundEnabled()) return
  if (getAlertSoundType() === 'crowd') {
    void loadCrowdBuffers()
  }
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

const TEST_NOTIFICATION_TAG = 'switcheroo-test'

function showBrowserNotification(title: string, body: string, tag: string): boolean {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  if (Notification.permission !== 'granted') return false

  new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag,
    requireInteraction: true,
    silent: false,
  })
  return true
}

export function fireBrowserNotification(moment: BigMoment): void {
  showBrowserNotification(moment.notificationTitle, moment.subtext, moment.eventKey)
}

export type TestAlertResult = 'sent' | 'blocked' | 'unsupported'

export async function runTestAlert(): Promise<TestAlertResult> {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window)) return 'unsupported'

  if (Notification.permission === 'default') {
    const granted = await requestNotificationPermission()
    if (!granted) return 'blocked'
  }

  if (Notification.permission === 'denied') return 'blocked'

  const sent = showBrowserNotification(ALERT_NOTIFICATION_TITLE, ALERT_SUBTEXT, TEST_NOTIFICATION_TAG)
  if (!sent) return 'blocked'

  playAlertSound()
  return 'sent'
}

export function playAlertSound(_level?: string): void {
  if (typeof window === 'undefined') return
  if (!getAlertSoundEnabled()) return

  if (getAlertSoundType() === 'ding') {
    playDingSound()
    return
  }

  void loadCrowdBuffers().then((buffers) => {
    const buffer = pickCrowdBuffer(buffers)
    if (!buffer) return
    playCrowdBuffer(buffer)
  })
}

export function previewAlertSound(type: AlertSoundType = getAlertSoundType()): void {
  if (typeof window === 'undefined') return

  if (type === 'ding') {
    playDingSound()
    return
  }

  void loadCrowdBuffers().then((buffers) => {
    const buffer = pickCrowdBuffer(buffers)
    if (!buffer) return
    playCrowdBuffer(buffer)
  })
}
