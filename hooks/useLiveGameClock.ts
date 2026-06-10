'use client'

import { useEffect, useState } from 'react'

export function formatLiveClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function useLiveGameClock(liveMinute: number | null, liveExtra: number | null) {
  const [anchor, setAnchor] = useState({ at: Date.now(), totalSeconds: 0 })
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (liveMinute === null) return
    setAnchor({
      at: Date.now(),
      totalSeconds: liveMinute * 60 + (liveExtra ?? 0) * 60,
    })
  }, [liveMinute, liveExtra])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (liveMinute === null) {
    return { totalSeconds: null, display: null }
  }

  const totalSeconds = anchor.totalSeconds + Math.floor((now - anchor.at) / 1000)

  return {
    totalSeconds,
    display: formatLiveClock(totalSeconds),
  }
}
