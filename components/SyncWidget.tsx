'use client'

import { useEffect, useState } from 'react'
import { formatLiveClock } from '@/hooks/useLiveGameClock'
import { isLiveStatus } from '@/lib/api'

type Props = {
  liveTotalSeconds: number | null
  liveDisplay: string | null
  matchStatus: string
  delaySeconds: number
  onChange: (seconds: number) => void
}

const FINISHED_STATUSES = ['FT', 'AET', 'PEN', 'AWD', 'WO']

export default function SyncWidget({
  liveTotalSeconds,
  liveDisplay,
  matchStatus,
  delaySeconds,
  onChange,
}: Props) {
  const [localDelay, setLocalDelay] = useState(delaySeconds)

  useEffect(() => {
    setLocalDelay(delaySeconds)
  }, [delaySeconds])

  const handleChange = (val: number) => {
    const clamped = Math.max(0, Math.min(300, val))
    setLocalDelay(clamped)
    onChange(clamped)
  }

  const isLive = isLiveStatus(matchStatus)
  const isFinished = FINISHED_STATUSES.includes(matchStatus)
  const canSync = isLive && liveTotalSeconds !== null && liveDisplay !== null

  if (isFinished) return null

  const delayRatio = localDelay / 300

  const delayControls = (
    <>
      <div className="space-y-2">
        <div
          className="slider-field relative"
          style={{ '--ratio': delayRatio } as React.CSSProperties}
        >
          {canSync && (
            <div className="relative mb-2 h-4">
              <span
                className="absolute top-0 -translate-x-1/2 text-xs font-medium tabular-nums text-white/55"
                style={{ left: 'var(--fill)' }}
              >
                {localDelay}s
              </span>
            </div>
          )}
          <div className="slider-root">
            <div className="slider-rail" aria-hidden />
            <input
              type="range"
              min={0}
              max={300}
              step={5}
              value={localDelay}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              className="delay-slider cursor-pointer"
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-white/35">
          <span>← less delay</span>
          <span>more delay →</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[+5, +10, +15, +30].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => handleChange(localDelay + delta)}
            className="glass-chip rounded-lg px-3 py-1 text-xs font-medium text-white/55"
          >
            +{delta}s
          </button>
        ))}
      </div>
    </>
  )

  if (!canSync) {
    return (
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white/85">Set your delay</h3>
          <p className="mt-1 text-xs text-white/45">
            Roughly how far behind live your stream will be.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 py-1">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black tabular-nums text-white">{localDelay}</span>
            <span className="pb-2 text-lg text-white/45">sec</span>
          </div>
        </div>

        {delayControls}
      </div>
    )
  }

  const delayedTotalSeconds = Math.max(0, liveTotalSeconds - localDelay)
  const delayedDisplay = formatLiveClock(delayedTotalSeconds)
  const isRoughMatch =
    localDelay > 0 &&
    Math.floor(liveTotalSeconds / 60) === Math.floor(delayedTotalSeconds / 60)

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white/85">Sync your delay</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass glass-emerald flex flex-col items-center gap-1.5 rounded-xl py-4">
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#CCFF00]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#CCFF00]">
              LIVE game time
            </span>
          </div>
          <div className="text-4xl font-black tabular-nums leading-none text-white">
            {liveDisplay}
          </div>
        </div>

        <div
          className={`flex flex-col items-center gap-1.5 rounded-xl py-4 transition-colors duration-200 ${
            isRoughMatch ? 'glass glass-amber' : 'glass glass-sky'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sky-300" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-200">
              Your screen
            </span>
          </div>
          <div className="text-4xl font-black tabular-nums leading-none text-white">
            {delayedDisplay}
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-[280px] text-balance text-center text-xs leading-relaxed text-white/45">
        Slide until the right clock matches your stream.
      </p>

      {delayControls}
    </div>
  )
}
