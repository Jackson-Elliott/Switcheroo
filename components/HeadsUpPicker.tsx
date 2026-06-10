'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/timing'

type Props = {
  delaySeconds: number
  headsUpSeconds: number
  onChange: (seconds: number) => void
}

function formatHeadsUpDisplay(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`
  if (seconds % 60 === 0) return `${seconds / 60} min`
  if (seconds % 60 === 30) return `${seconds / 60} min`
  return formatDuration(seconds)
}

export default function HeadsUpPicker({ delaySeconds, headsUpSeconds, onChange }: Props) {
  const maxHeadsUp = Math.max(1, delaySeconds)
  const minHeadsUp = Math.min(5, maxHeadsUp)
  const [localHeadsUp, setLocalHeadsUp] = useState(
    Math.min(headsUpSeconds, maxHeadsUp)
  )

  useEffect(() => {
    const clamped = Math.min(Math.max(headsUpSeconds, minHeadsUp), maxHeadsUp)
    setLocalHeadsUp(clamped)
    if (clamped !== headsUpSeconds) onChange(clamped)
  }, [delaySeconds]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocalHeadsUp(Math.min(headsUpSeconds, maxHeadsUp))
  }, [headsUpSeconds, maxHeadsUp])

  if (delaySeconds <= 0) {
    return (
      <div className="glass-inset rounded-xl p-4 text-xs text-white/45">
        With no stream delay, alerts fire the instant something happens live.
      </div>
    )
  }

  const handleChange = (val: number) => {
    const clamped = Math.max(minHeadsUp, Math.min(maxHeadsUp, val))
    setLocalHeadsUp(clamped)
    onChange(clamped)
  }

  const presets = [15, 30, 45, 60, 90, 120].filter((p) => p >= minHeadsUp && p <= maxHeadsUp)
  const sliderRange = maxHeadsUp - minHeadsUp
  const headsUpRatio = sliderRange > 0 ? (localHeadsUp - minHeadsUp) / sliderRange : 0

  return (
    <div className="glass glass-violet space-y-4 rounded-xl p-4">
      <div>
        <div className="text-sm font-medium text-white/90">How big a heads-up?</div>
        <div className="text-xs text-white/45 mt-0.5">
          We&apos;ll alert you this long before the moment hits your screen
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 py-2 text-center">
        <div className={`font-black tabular-nums text-white leading-none ${
          localHeadsUp > 60 ? 'text-3xl' : 'text-5xl'
        }`}>
          {formatHeadsUpDisplay(localHeadsUp)}
        </div>
      </div>

      {sliderRange > 0 && (
        <div
          className="slider-field space-y-2"
          style={{ '--ratio': headsUpRatio } as React.CSSProperties}
        >
          <div className="slider-root">
            <div className="slider-rail" aria-hidden />
            <input
              type="range"
              min={minHeadsUp}
              max={maxHeadsUp}
              step={5}
              value={localHeadsUp}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              className="delay-slider cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-white/35">
            <span>Just before</span>
            <span>As early as possible</span>
          </div>
        </div>
      )}

      {presets.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleChange(p)}
              className={`glass-chip rounded-lg px-3 py-1 text-xs font-medium transition-all duration-150 ${
                localHeadsUp === p
                  ? 'glass-chip-active glass-violet text-violet-200'
                  : 'text-white/55'
              }`}
            >
              {formatHeadsUpDisplay(p)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
