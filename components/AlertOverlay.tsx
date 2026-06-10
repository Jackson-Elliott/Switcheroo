'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ALERT_STYLES, type AlertLevel, type BigMoment } from '@/lib/events'

type Props = {
  moment: BigMoment
  countdownSeconds: number
  onDismiss: () => void
}

export default function AlertOverlay({ moment, countdownSeconds, onDismiss }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds)
  const [phase, setPhase] = useState<'arriving' | 'imminent' | 'now'>('arriving')
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const styles = ALERT_STYLES[moment.level]

  useEffect(() => {
    setMounted(true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    if (countdownSeconds <= 0) {
      setSecondsLeft(0)
      setPhase('now')
      return
    }

    setSecondsLeft(countdownSeconds)
    setPhase(countdownSeconds > 10 ? 'arriving' : 'imminent')

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(intervalRef.current!)
          setPhase('now')
          return 0
        }
        if (next <= 10) setPhase('imminent')
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [countdownSeconds])

  const progress = countdownSeconds > 0 ? (secondsLeft / countdownSeconds) * 100 : 0
  const circumference = 2 * Math.PI * 60
  const strokeColor =
    moment.level === 'critical'
      ? '#ef4444'
      : moment.level === 'high'
        ? '#f97316'
        : moment.level === 'medium'
          ? '#eab308'
          : '#3b82f6'

  return mounted
    ? createPortal(
        <div
          role="alertdialog"
          aria-modal="true"
          aria-live="assertive"
          className={`fixed inset-0 z-[9999] flex min-h-dvh w-screen flex-col items-center justify-center p-6 ${styles.bg} ${styles.glow} transition-all duration-500`}
        >
          <div className={`pointer-events-none absolute inset-0 border-4 ${styles.border} opacity-60`} />
          <PulseRings level={moment.level} />

          <div className="relative z-10 flex max-w-xs w-full flex-col items-center gap-8 text-center">
            {phase !== 'now' && countdownSeconds > 0 && (
              <div className="relative flex items-center justify-center">
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 140 140"
                  className={`-rotate-90 ${phase === 'imminent' ? 'animate-pulse' : ''}`}
                >
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress / 100)}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tabular-nums text-white leading-none">{secondsLeft}</span>
                  <span className="text-xs text-white/40 mt-1 uppercase tracking-wider">seconds</span>
                </div>
              </div>
            )}

            {phase === 'now' && (
              <div className="animate-bounce-once">
                <div className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl">NOW</div>
              </div>
            )}

            <div className="space-y-3">
              <h1
                className={`font-black uppercase tracking-tight leading-none ${styles.textColor} ${
                  moment.level === 'critical' ? 'text-3xl' : 'text-2xl'
                }`}
              >
                {moment.headline}
              </h1>
              <p className="text-sm text-white/50 leading-relaxed px-2">{moment.subtext}</p>
            </div>

            {phase === 'arriving' && countdownSeconds > 0 && (
              <p className="text-xs text-white/40">
                Heads up — it&apos;s about to hit your screen in{' '}
                <strong className="text-white/70">{secondsLeft}s</strong>
              </p>
            )}
            {phase === 'imminent' && (
              <p className={`text-sm font-semibold ${styles.textColor} animate-pulse`}>
                Get ready — it&apos;s almost on your screen!
              </p>
            )}
            {phase === 'now' && (
              <p className="text-sm font-bold text-white animate-pulse">
                It&apos;s happening on your screen RIGHT NOW
              </p>
            )}

            <button
              onClick={onDismiss}
              className="glass-btn rounded-xl px-8 py-3 text-sm font-semibold active:scale-95"
            >
              I&apos;m watching 👀
            </button>
          </div>
        </div>,
        document.body
      )
    : null
}

function PulseRings({ level }: { level: AlertLevel }) {
  const colors: Record<AlertLevel, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  }
  const color = colors[level]

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`absolute rounded-full ${color} opacity-10`}
          style={{
            width: `${(i + 1) * 30}vmax`,
            height: `${(i + 1) * 30}vmax`,
            animation: `pulse-ring 2s ${i * 0.4}s ease-out infinite`,
          }}
        />
      ))}
    </div>
  )
}
