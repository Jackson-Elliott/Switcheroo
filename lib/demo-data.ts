import type { MatchEvent } from './events'
import type { Fixture } from './api'

const LEAGUE = {
  id: 1,
  name: 'FIFA World Cup',
  country: 'World',
  logo: '',
  flag: '',
  season: 2026,
  round: 'Group Stage',
}

function demoMatch(
  id: number,
  home: { id: number; name: string; logo: string },
  away: { id: number; name: string; logo: string },
  opts: {
    status: Fixture['fixture']['status']
    goals?: Fixture['goals']
    date?: string
    round?: string
  }
): Fixture {
  return {
    fixture: {
      id,
      date: opts.date ?? new Date().toISOString(),
      status: opts.status,
    },
    league: { ...LEAGUE, round: opts.round ?? LEAGUE.round },
    teams: {
      home: { ...home, winner: null },
      away: { ...away, winner: null },
    },
    goals: opts.goals ?? { home: null, away: null },
  }
}

export const DEMO_FIXTURES: Fixture[] = [
  demoMatch(
    1001,
    { id: 10, name: 'Australia', logo: '🇦🇺' },
    { id: 11, name: 'Turkey', logo: '🇹🇷' },
    {
      status: { elapsed: 34, extra: null, long: 'First Half', short: '1H' },
      goals: { home: 0, away: 0 },
      round: 'Group Stage - 1',
    }
  ),
  demoMatch(
    1002,
    { id: 20, name: 'Brazil', logo: '🇧🇷' },
    { id: 21, name: 'Argentina', logo: '🇦🇷' },
    {
      status: { elapsed: 67, extra: null, long: 'Second Half', short: '2H' },
      goals: { home: 1, away: 1 },
      round: 'Group Stage - 2',
    }
  ),
  demoMatch(
    1003,
    { id: 30, name: 'England', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 31, name: 'France', logo: '🇫🇷' },
    {
      status: { elapsed: null, extra: null, long: 'Not Started', short: 'NS' },
      date: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      round: 'Group Stage - 1',
    }
  ),
  demoMatch(
    1004,
    { id: 40, name: 'Spain', logo: '🇪🇸' },
    { id: 41, name: 'Germany', logo: '🇩🇪' },
    {
      status: { elapsed: null, extra: null, long: 'Not Started', short: 'NS' },
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      round: 'Group Stage - 2',
    }
  ),
  demoMatch(
    1005,
    { id: 50, name: 'Japan', logo: '🇯🇵' },
    { id: 51, name: 'USA', logo: '🇺🇸' },
    {
      status: { elapsed: null, extra: null, long: 'Not Started', short: 'NS' },
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      round: 'Group Stage - 3',
    }
  ),
]

export function isDemoMode(): boolean {
  const key = process.env.API_FOOTBALL_KEY
  return !key || key === 'demo'
}

function getDemoEvents(watchStartTime: number): MatchEvent[] {
  const elapsed = Math.floor((Date.now() - watchStartTime) / 1000)
  const events: MatchEvent[] = [
    {
      time: { elapsed: 12, extra: null },
      team: { id: 10, name: 'Team A', logo: '' },
      player: { id: 1, name: 'Player One' },
      assist: { id: null, name: null },
      type: 'Card',
      detail: 'Yellow Card',
      comments: null,
    },
  ]

  if (elapsed >= 45) {
    events.push({
      time: { elapsed: 41, extra: null },
      team: { id: 11, name: 'Team B', logo: '' },
      player: { id: null, name: null },
      assist: { id: null, name: null },
      type: 'Chance',
      detail: 'Big Chance',
      comments: 'big-chance-11-1',
    })
  }

  if (elapsed >= 30) {
    events.push({
      time: { elapsed: 55, extra: null },
      team: { id: 10, name: 'Team A', logo: '' },
      player: { id: 2, name: 'Player Two' },
      assist: { id: null, name: null },
      type: 'Card',
      detail: 'Red Card',
      comments: null,
    })
  }

  if (elapsed >= 60) {
    events.push({
      time: { elapsed: 67, extra: null },
      team: { id: 11, name: 'Team B', logo: '' },
      player: { id: 3, name: 'Player Three' },
      assist: { id: null, name: null },
      type: 'Goal',
      detail: 'Normal Goal',
      comments: null,
    })
  }

  if (elapsed >= 90) {
    events.push({
      time: { elapsed: 74, extra: null },
      team: { id: 10, name: 'Team A', logo: '' },
      player: { id: null, name: null },
      assist: { id: null, name: null },
      type: 'Var',
      detail: 'Penalty confirmed',
      comments: null,
    })
  }

  return events
}

export function getDemoFixtureWithEvents(id: number, watchStartTime: number) {
  const base = DEMO_FIXTURES.find((fixture) => fixture.fixture.id === id) ?? DEMO_FIXTURES[0]
  const kickoffMs = new Date(base.fixture.date).getTime()
  const hasKickoffPassed = Date.now() >= kickoffMs
  const isNotStarted = base.fixture.status.short === 'NS'

  if (isNotStarted && !hasKickoffPassed) {
    return {
      ...base,
      events: [],
    }
  }

  if (isNotStarted && hasKickoffPassed) {
    const minutesPlayed = Math.max(0, Math.floor((Date.now() - kickoffMs) / 60_000))

    return {
      ...base,
      fixture: {
        ...base.fixture,
        status: {
          elapsed: Math.min(minutesPlayed, 90),
          extra: null,
          long: minutesPlayed >= 45 ? 'Second Half' : 'First Half',
          short: minutesPlayed >= 45 ? '2H' : '1H',
        },
      },
      events: getDemoEvents(watchStartTime),
    }
  }

  return {
    ...base,
    fixture: {
      ...base.fixture,
      status: {
        elapsed: base.fixture.status.elapsed ?? 34,
        extra: base.fixture.status.extra,
        long: base.fixture.status.long,
        short: base.fixture.status.short,
      },
    },
    events: getDemoEvents(watchStartTime),
  }
}
