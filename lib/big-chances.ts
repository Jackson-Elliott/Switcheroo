import type { MatchEvent } from './events'

export const BIG_CHANCE_EVENT_TYPE = 'Chance'

type TeamRef = { id: number; name: string; logo: string }

type FixtureStatistics = {
  team: TeamRef
  statistics: { type: string; value: number | string | null }[]
}[]

type StatTracker = {
  id: string
  detail: string
  commentPrefix: string
  matches: (type: string) => boolean
}

const STAT_TRACKERS: StatTracker[] = [
  {
    id: 'big-chances',
    detail: 'Big Chance',
    commentPrefix: 'big-chance',
    matches: (type) => normalizeStatType(type) === 'big chances',
  },
  {
    id: 'shots-on-goal',
    detail: 'Shot on Goal',
    commentPrefix: 'shot-on-goal',
    matches: (type) => {
      const normalized = normalizeStatType(type)
      return normalized === 'shots on goal' || normalized === 'shots on target'
    },
  },
]

function normalizeStatType(type: string): string {
  return type.toLowerCase().replace(/\s+/g, ' ')
}

function statCountKey(teamId: number, trackerId: string): string {
  return `${teamId}:${trackerId}`
}

function parseStatValue(value: number | string | null): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function readStatCounts(statistics: unknown, tracker: StatTracker): Map<number, number> {
  const counts = new Map<number, number>()
  if (!Array.isArray(statistics)) return counts

  for (const entry of statistics as FixtureStatistics) {
    const teamId = entry?.team?.id
    if (!teamId) continue

    const stat = entry.statistics?.find((item) => tracker.matches(item.type))
    if (stat) {
      counts.set(teamId, parseStatValue(stat.value))
    }
  }

  return counts
}

function createStatChanceEvent(
  team: TeamRef,
  minute: number,
  tracker: StatTracker,
  ordinal: number
): MatchEvent {
  return {
    time: { elapsed: minute, extra: null },
    team: { id: team.id, name: team.name, logo: team.logo },
    player: { id: null, name: null },
    assist: { id: null, name: null },
    type: BIG_CHANCE_EVENT_TYPE,
    detail: tracker.detail,
    comments: `${tracker.commentPrefix}-${team.id}-${ordinal}`,
  }
}

export function extractNewBigChanceEvents(
  statistics: unknown,
  teams: { home: TeamRef; away: TeamRef },
  minute: number | null,
  previousCounts: Map<string, number>
): { events: MatchEvent[]; nextCounts: Map<string, number> } {
  const nextCounts = new Map(previousCounts)
  const events: MatchEvent[] = []
  const eventMinute = minute ?? 0

  for (const tracker of STAT_TRACKERS) {
    const currentCounts = readStatCounts(statistics, tracker)

    for (const team of [teams.home, teams.away]) {
      const key = statCountKey(team.id, tracker.id)
      const current = currentCounts.get(team.id) ?? 0
      const previous = previousCounts.get(key) ?? 0

      nextCounts.set(key, current)

      if (current <= previous) continue

      for (let ordinal = previous + 1; ordinal <= current; ordinal += 1) {
        events.push(createStatChanceEvent(team, eventMinute, tracker, ordinal))
      }
    }
  }

  return { events, nextCounts }
}

export function seedBigChanceCounts(
  statistics: unknown,
  store: Map<string, number>
): void {
  for (const tracker of STAT_TRACKERS) {
    const counts = readStatCounts(statistics, tracker)
    for (const [teamId, count] of counts) {
      store.set(statCountKey(teamId, tracker.id), count)
    }
  }
}
