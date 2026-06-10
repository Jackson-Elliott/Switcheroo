'use client'

import { useEffect, useState } from 'react'
import { getMinutesUntilKickoff, isNotStartedStatus, type Fixture } from '@/lib/api'
import { formatKickoffDateTime } from '@/lib/timezone'
import { useUserTimezone } from '@/hooks/useUserTimezone'

type Props = {
  fixture: Fixture
  matchStatus: string
}

export default function PreMatchCountdown({ fixture, matchStatus }: Props) {
  const { timeZone } = useUserTimezone()
  const [minutesUntil, setMinutesUntil] = useState<number | null>(() =>
    getMinutesUntilKickoff(fixture)
  )

  useEffect(() => {
    if (!isNotStartedStatus(matchStatus)) return
    const id = setInterval(() => {
      setMinutesUntil(getMinutesUntilKickoff(fixture))
    }, 30_000)
    return () => clearInterval(id)
  }, [fixture, matchStatus])

  if (!isNotStartedStatus(matchStatus)) return null

  const kickoffLabel = formatKickoffDateTime(fixture.fixture.date, timeZone)

  return (
    <div className="glass glass-amber space-y-2 rounded-xl p-4">
      <div className="text-sm font-medium text-amber-100/90">Waiting for kickoff</div>
      <p className="text-xs leading-relaxed text-white/50">
        Kickoff at <strong className="text-white/70">{kickoffLabel}</strong>. We&apos;ll start
        watching automatically — keep this tab open.
      </p>
      {minutesUntil !== null && minutesUntil > 0 && (
        <p className="text-2xl font-black tabular-nums text-amber-200">
          {minutesUntil}
          <span className="ml-1 text-sm font-semibold text-amber-200/70">min to go</span>
        </p>
      )}
      {minutesUntil === 0 && (
        <p className="text-sm font-semibold text-zesty">Starting now — polling for live events…</p>
      )}
    </div>
  )
}
