'use client'

import { useUserTimezone } from '@/hooks/useUserTimezone'
import { useLiveGameClock } from '@/hooks/useLiveGameClock'
import {
  formatMatchTime,
  isLiveStatus,
  isNotStartedStatus,
  type Fixture,
} from '@/lib/api'

export type MatchDisplayState = {
  matchStatus: string
  goals: Fixture['goals']
  currentMinute: number | null
  currentExtra: number | null
}

type Props = {
  fixture: Fixture
  matchStatus: string
  goals: Fixture['goals']
  currentMinute: number | null
  currentExtra?: number | null
  onChange?: () => void
  compact?: boolean
}

function formatMatchStatusLabel(status: string): string {
  if (isNotStartedStatus(status)) return 'Upcoming game'
  return status
}

export default function MatchScoreCard({
  fixture,
  matchStatus,
  goals,
  currentMinute,
  currentExtra = null,
  onChange,
  compact = false,
}: Props) {
  const { timeZone } = useUserTimezone()
  const isLive = isLiveStatus(matchStatus)
  const isFinished = ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(matchStatus)
  const { display: liveGameClockDisplay } = useLiveGameClock(currentMinute, currentExtra)

  return (
    <div className={`glass rounded-2xl ${compact ? 'p-4' : 'p-5'}`}>
      <div className={`flex w-full items-center justify-between ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="glass-badge flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#CCFF00]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#CCFF00]" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Finished
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {formatMatchStatusLabel(matchStatus)}
            </span>
          )}
        </div>
        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="glass-chip ml-auto shrink-0 rounded-md px-2 py-0.5 text-[10px] text-white/45 hover:text-white"
          >
            Change game
          </button>
        )}
      </div>

      <div className={`flex items-center justify-center ${compact ? 'gap-2.5' : 'gap-5'}`}>
        <TeamDisplay name={fixture.teams.home.name} logo={fixture.teams.home.logo} compact={compact} />
        <div className="flex flex-col items-center gap-0.5">
          <div
            className={`font-bold tabular-nums text-white ${compact ? 'text-3xl' : 'text-4xl'}`}
          >
            {goals.home ?? '–'} <span className="text-[#CCFF00]">:</span> {goals.away ?? '–'}
          </div>
          <div className="text-[10px] tabular-nums text-white/40">
            {isLive && liveGameClockDisplay
              ? liveGameClockDisplay
              : isNotStartedStatus(matchStatus)
                ? '00:00'
                : currentMinute !== null
                  ? `${currentMinute}'`
                  : formatMatchTime(fixture, timeZone)}
          </div>
        </div>
        <TeamDisplay name={fixture.teams.away.name} logo={fixture.teams.away.logo} compact={compact} />
      </div>
    </div>
  )
}

function TeamDisplay({
  name,
  logo,
  compact = false,
}: {
  name: string
  logo: string
  compact?: boolean
}) {
  const isEmoji = logo && !logo.startsWith('http')
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      {isEmoji ? (
        <span className={`leading-none ${compact ? 'text-4xl' : 'text-[2.7rem]'}`}>{logo}</span>
      ) : logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className={compact ? 'h-[38px] w-[38px] object-contain' : 'h-12 w-12 object-contain'}
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full glass-inset text-sm ${
            compact ? 'h-[38px] w-[38px]' : 'h-12 w-12'
          }`}
        >
          ⚽
        </span>
      )}
      <span
        className={`font-medium text-white/80 text-center leading-tight ${
          compact ? 'max-w-[77px] text-[12px]' : 'max-w-[96px] text-[1.05rem]'
        }`}
      >
        {name}
      </span>
    </div>
  )
}
