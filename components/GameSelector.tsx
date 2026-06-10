'use client'

import { useEffect, useMemo, useState } from 'react'
import { useUserTimezone } from '@/hooks/useUserTimezone'
import {
  fetchLiveAndTodayMatches,
  formatMatchDateTime,
  formatMatchTime,
  getMatchBucket,
  getMinutesUntilKickoff,
  isMatchSelectable,
  type Fixture,
} from '@/lib/api'

type Props = {
  onSelect: (fixture: Fixture) => void
  onDemoChange?: (demo: boolean) => void
}

export default function GameSelector({ onSelect, onDemoChange }: Props) {
  const { timeZone, ready } = useUserTimezone()
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFreePlan, setIsFreePlan] = useState(false)
  const [noSchedule, setNoSchedule] = useState(false)

  useEffect(() => {
    if (!ready) return

    setLoading(true)
    setError(null)

    fetchLiveAndTodayMatches(timeZone)
      .then(({ fixtures, free_plan, no_schedule, demo }) => {
        setFixtures(fixtures.filter(isMatchSelectable))
        setIsFreePlan(free_plan ?? false)
        setNoSchedule(no_schedule ?? false)
        setError(null)
        onDemoChange?.(demo)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load matches. Try refreshing the page.')
        setLoading(false)
      })
  }, [ready, timeZone, onDemoChange])

  const grouped = useMemo(() => {
    const live: Fixture[] = []
    const startingSoon: Fixture[] = []

    for (const fixture of fixtures) {
      const bucket = getMatchBucket(fixture, timeZone)
      if (bucket === 'live') {
        live.push(fixture)
      } else if (bucket === 'starting-soon') {
        startingSoon.push(fixture)
      }
    }

    startingSoon.sort(
      (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    )

    return { live, startingSoon }
  }, [fixtures, timeZone])

  return (
    <div className="space-y-8">
      {loading && (
        <div className="flex items-center gap-3 text-white/55">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-zesty/80" />
          Loading matches...
        </div>
      )}

      {error && (
        <div className="glass glass-danger rounded-xl px-4 py-3 text-sm text-red-200/90">
          {error}
        </div>
      )}

      {isFreePlan && (
        <div className="glass glass-warning rounded-xl px-4 py-3 text-sm text-amber-200/90">
          <span className="font-semibold">Free API plan detected.</span> Live World Cup matches
          appear here automatically.{' '}
          <a
            href="https://api-sports.io/documentation/football/v3#section/Introduction/Subscriptions-and-billing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-amber-400 hover:text-amber-300"
          >
            Upgrade at api-sports.io →
          </a>
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && noSchedule && (
        <div className="py-10 text-center text-white/45 space-y-3">
          <div className="text-5xl">⏳</div>
          <p className="text-lg font-medium text-white/70">No World Cup matches available right now</p>
          <p className="text-sm leading-relaxed max-w-xs mx-auto">
            Live games will appear here as soon as they kick off.
          </p>
        </div>
      )}

      {!loading && !error && grouped.live.length > 0 && (
        <section>
          <SectionHeader
            title="LIVE now"
            accent="zesty"
            pulse
          />
          <div className="space-y-3">
            {grouped.live.map((fixture) => (
              <MatchCard
                key={fixture.fixture.id}
                fixture={fixture}
                bucket="live"
                timeZone={timeZone}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && grouped.startingSoon.length > 0 && (
        <section>
          <SectionHeader
            title="Starting soon"
            accent="amber"
          />
          <div className="space-y-3">
            {grouped.startingSoon.map((fixture) => (
              <MatchCard
                key={fixture.fixture.id}
                fixture={fixture}
                bucket="starting-soon"
                timeZone={timeZone}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  accent,
  pulse = false,
}: {
  title: string
  subtitle?: string
  accent: 'zesty' | 'amber'
  pulse?: boolean
}) {
  const accentClasses = {
    zesty: 'text-zesty',
    amber: 'text-amber-400',
  }
  const dotClasses = {
    zesty: 'bg-zesty',
    amber: 'bg-amber-400',
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotClasses[accent]} ${
            pulse ? 'animate-pulse' : ''
          }`}
        />
        <h3 className={`text-xs font-semibold uppercase tracking-widest ${accentClasses[accent]}`}>
          {title}
        </h3>
      </div>
      {subtitle && <p className="mt-1 pl-4 text-xs text-white/40">{subtitle}</p>}
    </div>
  )
}

function MatchCard({
  fixture,
  bucket,
  timeZone,
  onSelect,
}: {
  fixture: Fixture
  bucket: 'live' | 'starting-soon'
  timeZone: string
  onSelect: (f: Fixture) => void
}) {
  const homeScore = fixture.goals.home ?? ''
  const awayScore = fixture.goals.away ?? ''
  const hasScore = fixture.goals.home !== null
  const minutesUntil = getMinutesUntilKickoff(fixture)

  const styles = {
    live: {
      card: 'glass glass-emerald glass-interactive',
      badge: 'glass-badge text-zesty',
      badgeText: 'LIVE · tap to watch',
      time: 'text-zesty',
      arrow: 'text-zesty',
    },
    'starting-soon': {
      card: 'glass glass-amber glass-interactive',
      badge: 'glass-badge text-amber-200',
      badgeText:
        minutesUntil !== null && minutesUntil > 0
          ? `Starts in ${minutesUntil} min`
          : 'Starting now',
      time: 'text-amber-200',
      arrow: 'text-amber-300',
    },
  }[bucket]

  const timeLabel =
    bucket === 'live'
      ? formatMatchTime(fixture, timeZone)
      : formatMatchDateTime(fixture)

  return (
    <button
      type="button"
      onClick={() => onSelect(fixture)}
      className={`group w-full rounded-xl p-4 text-left cursor-pointer ${styles.card}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
        >
          {styles.badgeText}
        </span>
        <span className={`text-xs font-medium transition-colors ${styles.arrow} opacity-80 group-hover:opacity-100`}>
          Select →
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <TeamBlock name={fixture.teams.home.name} logo={fixture.teams.home.logo} align="right" />

          <div className="flex min-w-[88px] flex-col items-center gap-1">
            {hasScore ? (
              <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {homeScore} <span className="text-[#CCFF00]">–</span> {awayScore}
              </span>
            ) : (
              <span className="text-sm font-medium text-white/40">vs</span>
            )}
            <span className={`text-xs font-medium ${styles.time}`}>{timeLabel}</span>
          </div>

          <TeamBlock name={fixture.teams.away.name} logo={fixture.teams.away.logo} align="left" />
        </div>
      </div>

      {fixture.league.round && (
        <div className="mt-2 text-xs text-white/35 group-hover:text-white/50">{fixture.league.round}</div>
      )}
    </button>
  )
}

function TeamBlock({
  name,
  logo,
  align,
}: {
  name: string
  logo: string
  align: 'left' | 'right'
}) {
  const isEmoji = logo && !logo.startsWith('http')

  return (
    <div
      className={`flex flex-1 flex-col gap-1 ${
        align === 'right' ? 'items-end text-right' : 'items-start text-left'
      }`}
    >
      {isEmoji ? (
        <span className="text-3xl leading-none">{logo}</span>
      ) : logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className="h-8 w-8 object-contain" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-inset text-xs text-white/50">
          ⚽
        </span>
      )}
      <span className="text-sm font-medium text-white/85 leading-tight">{name}</span>
    </div>
  )
}
