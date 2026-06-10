import {
  formatKickoffDate,
  formatKickoffDateTime,
  formatKickoffTime,
} from './timezone'

export const STARTING_SOON_WINDOW_MINUTES = 120

export type Fixture = {
  fixture: {
    id: number
    date: string
    status: {
      elapsed: number | null
      extra: number | null
      long: string
      short: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    round: string
  }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

export type FixtureWithEvents = Fixture & {
  events: import('./events').MatchEvent[]
  statistics?: unknown
}

export async function fetchLiveAndTodayMatches(timeZone?: string): Promise<{
  fixtures: Fixture[]
  demo: boolean
  free_plan?: boolean
  no_schedule?: boolean
}> {
  const tz = encodeURIComponent(timeZone ?? 'UTC')
  const res = await fetch(`/api/matches?tz=${tz}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return {
    fixtures: data.response ?? [],
    demo: Boolean(data.demo),
    free_plan: Boolean(data.free_plan),
    no_schedule: Boolean(data.no_schedule),
  }
}

export async function fetchFixtureWithEvents(
  id: number,
  watchStartTime?: number
): Promise<FixtureWithEvents | null> {
  const url = watchStartTime ? `/api/events/${id}?t=${watchStartTime}` : `/api/events/${id}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  return data.response?.[0] ?? null
}

const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE']
const FINISHED_STATUSES = ['FT', 'AET', 'PEN', 'AWD', 'WO', 'CANC', 'ABD', 'PST']

export function isLiveStatus(status: string): boolean {
  return LIVE_STATUSES.includes(status)
}

const NOT_STARTED_STATUSES = ['NS', 'TBD']

export function isNotStartedStatus(status: string): boolean {
  return NOT_STARTED_STATUSES.includes(status)
}

export function isMatchSelectable(fixture: Fixture): boolean {
  return !FINISHED_STATUSES.includes(fixture.fixture.status.short)
}

export type MatchBucket = 'live' | 'starting-soon' | 'future'

export function getMatchBucket(fixture: Fixture, _timeZone: string, now = new Date()): MatchBucket {
  if (isLiveStatus(fixture.fixture.status.short)) return 'live'

  const minutesUntil = getMinutesUntilKickoff(fixture, now)
  if (minutesUntil !== null && minutesUntil <= STARTING_SOON_WINDOW_MINUTES) {
    return 'starting-soon'
  }

  return 'future'
}

export function formatMatchTime(fixture: Fixture, timeZone: string): string {
  const { elapsed, extra, short } = fixture.fixture.status
  if (short === 'HT') return 'Half Time'
  if (short === 'FT') return 'Full Time'
  if (short === 'AET') return 'After Extra Time'
  if (short === 'PEN' || short === 'P') return 'Penalties'
  if (short === 'ET') return `ET ${elapsed ?? 0}'`
  if (elapsed !== null) {
    return `${elapsed}${extra ? `+${extra}` : ''}'`
  }
  return formatKickoffTime(fixture.fixture.date, timeZone)
}

export function formatMatchDate(fixture: Fixture, timeZone: string): string {
  return formatKickoffDate(fixture.fixture.date, timeZone)
}

export function formatMatchDateTime(fixture: Fixture): string {
  return formatKickoffDateTime(fixture.fixture.date)
}

export function getMinutesUntilKickoff(fixture: Fixture, now = new Date()): number | null {
  const status = fixture.fixture.status.short
  if (isLiveStatus(status) || FINISHED_STATUSES.includes(status)) return null
  return Math.max(0, Math.round((new Date(fixture.fixture.date).getTime() - now.getTime()) / 60_000))
}
