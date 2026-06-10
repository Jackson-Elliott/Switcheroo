import {
  DEFAULT_ALERT_PREFERENCES,
  isAlertEnabled,
  type AlertPreferences,
} from './alert-preferences'

export type MatchEvent = {
  time: { elapsed: number; extra: number | null }
  team: { id: number; name: string; logo: string }
  player: { id: number | null; name: string | null }
  assist: { id: number | null; name: string | null }
  type: string
  detail: string
  comments: string | null
}

export const ALERT_LEVEL = 'critical' as const
export type AlertLevel = typeof ALERT_LEVEL

export type BigMoment = {
  eventKey: string
  level: AlertLevel
  headline: string
  subtext: string
  event: MatchEvent
}

const ALERT_HEADLINE = 'PUT YOUR EYES ON THE SCREEN'
const ALERT_SUBTEXT =
  "Get Command+Tab ready — there's a big moment worth switching for."

export function getEventKey(event: MatchEvent): string {
  const extra = event.time.extra ? `+${event.time.extra}` : ''
  if (event.type === 'Chance' && event.comments) {
    return `${event.time.elapsed}${extra}-${event.type}-${event.detail}-${event.comments}`
  }
  return `${event.time.elapsed}${extra}-${event.type}-${event.detail}-${event.player.name ?? 'unknown'}`
}

function createAlert(event: MatchEvent): BigMoment {
  return {
    eventKey: getEventKey(event),
    level: ALERT_LEVEL,
    headline: ALERT_HEADLINE,
    subtext: ALERT_SUBTEXT,
    event,
  }
}

export function classifyEvent(
  event: MatchEvent,
  preferences: AlertPreferences = DEFAULT_ALERT_PREFERENCES
): BigMoment | null {
  if (!isAlertEnabled(event.type, event.detail, preferences)) return null
  return createAlert(event)
}

export const ALERT_STYLES = {
  critical: {
    bg: 'bg-red-950/95',
    border: 'border-red-500',
    glow: 'shadow-[0_0_80px_rgba(239,68,68,0.4)]',
    textColor: 'text-red-100',
    pulseColor: 'bg-red-500',
  },
  high: {
    bg: 'bg-orange-950/95',
    border: 'border-orange-500',
    glow: 'shadow-[0_0_80px_rgba(249,115,22,0.4)]',
    textColor: 'text-orange-100',
    pulseColor: 'bg-orange-500',
  },
  medium: {
    bg: 'bg-yellow-950/95',
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_80px_rgba(234,179,8,0.4)]',
    textColor: 'text-yellow-100',
    pulseColor: 'bg-yellow-500',
  },
  low: {
    bg: 'bg-blue-950/95',
    border: 'border-blue-500',
    glow: 'shadow-[0_0_80px_rgba(59,130,246,0.4)]',
    textColor: 'text-blue-100',
    pulseColor: 'bg-blue-500',
  },
} as const satisfies Record<
  AlertLevel,
  {
    bg: string
    border: string
    glow: string
    textColor: string
    pulseColor: string
  }
>

export const ALERT_STYLE = ALERT_STYLES.critical
