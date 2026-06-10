'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLiveGameClock } from '@/hooks/useLiveGameClock'
import { fetchFixtureWithEvents, type Fixture } from '@/lib/api'
import {
  extractNewBigChanceEvents,
  seedBigChanceCounts,
} from '@/lib/big-chances'
import { classifyEvent, getEventKey, type BigMoment } from '@/lib/events'
import { fireBrowserNotification, getAlertSoundEnabled, playAlertSound, preloadAlertSound } from '@/lib/notifications'
import { getEffectiveHeadsUp, getNotificationWaitMs } from '@/lib/timing'
import AlertOverlay from './AlertOverlay'
import AlertSoundToggle from './AlertSoundToggle'
import HeadsUpPicker from './HeadsUpPicker'
import SyncWidget from './SyncWidget'
import { type MatchDisplayState } from './MatchScoreCard'

const POLL_INTERVAL_MS = 5_000

type Props = {
  fixture: Fixture
  delaySeconds: number
  headsUpSeconds: number
  onDelayChange: (seconds: number) => void
  onHeadsUpChange: (seconds: number) => void
  onWatchHintChange?: (hint: string | null) => void
  onDisplayUpdate?: (display: MatchDisplayState) => void
}

export default function MatchWatcher({
  fixture,
  delaySeconds,
  headsUpSeconds,
  onDelayChange,
  onHeadsUpChange,
  onWatchHintChange,
  onDisplayUpdate,
}: Props) {
  const [currentMinute, setCurrentMinute] = useState<number | null>(
    fixture.fixture.status.elapsed
  )
  const [currentExtra, setCurrentExtra] = useState<number | null>(
    fixture.fixture.status.extra
  )
  const [matchStatus, setMatchStatus] = useState(fixture.fixture.status.short)
  const [goals, setGoals] = useState(fixture.goals)
  const [activeMoment, setActiveMoment] = useState<BigMoment | null>(null)
  const [activeCountdown, setActiveCountdown] = useState(0)
  const [scheduledFireAt, setScheduledFireAt] = useState<number[]>([])
  const [tick, setTick] = useState(0)

  const seenEventKeys = useRef<Set<string>>(new Set())
  const isFirstPoll = useRef(true)
  const watchStartTime = useRef(Date.now())
  const pendingAlerts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const bigChanceCountsRef = useRef<Map<string, number>>(new Map())

  const triggerAlert = useCallback((moment: BigMoment, countdownSeconds: number) => {
    fireBrowserNotification(moment)
    playAlertSound(moment.level)
    setActiveCountdown(countdownSeconds)
    setActiveMoment(moment)
  }, [])

  useEffect(() => {
    if (getAlertSoundEnabled()) preloadAlertSound()
  }, [])

  const poll = useCallback(async () => {
    try {
      const data = await fetchFixtureWithEvents(fixture.fixture.id, watchStartTime.current)
      if (!data) return

      setCurrentMinute(data.fixture.status.elapsed)
      setCurrentExtra(data.fixture.status.extra)
      setMatchStatus(data.fixture.status.short)
      setGoals(data.goals)

      const apiEvents = data.events ?? []

      if (isFirstPoll.current) {
        apiEvents.forEach((ev) => seenEventKeys.current.add(getEventKey(ev)))
        seedBigChanceCounts(data.statistics, bigChanceCountsRef.current)
        isFirstPoll.current = false
        return
      }

      const { events: statBigChances, nextCounts } = extractNewBigChanceEvents(
        data.statistics,
        data.teams,
        data.fixture.status.elapsed,
        bigChanceCountsRef.current
      )
      bigChanceCountsRef.current = nextCounts

      const events = [...apiEvents, ...statBigChances]

      // Detect new big moments
      for (const event of events) {
        const key = getEventKey(event)
        if (seenEventKeys.current.has(key)) continue
        seenEventKeys.current.add(key)

        const moment = classifyEvent(event)
        if (!moment) continue

        const countdown = getEffectiveHeadsUp(delaySeconds, headsUpSeconds)
        const waitMs = getNotificationWaitMs(delaySeconds, headsUpSeconds)
        const fireAt = Date.now() + waitMs

        const timeout = setTimeout(() => {
          pendingAlerts.current.delete(moment.eventKey)
          setScheduledFireAt((prev) => prev.filter((t) => t !== fireAt))
          triggerAlert(moment, countdown)
        }, waitMs)

        pendingAlerts.current.set(moment.eventKey, timeout)
        setScheduledFireAt((prev) => [...prev, fireAt].sort((a, b) => a - b))
      }
    } catch {
      // Polling will retry on the next interval
    }
  }, [fixture.fixture.id, delaySeconds, headsUpSeconds, triggerAlert])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      clearInterval(interval)
      pendingAlerts.current.forEach(clearTimeout)
      pendingAlerts.current.clear()
      setScheduledFireAt([])
    }
  }, [poll])

  useEffect(() => {
    if (scheduledFireAt.length === 0 && !activeMoment) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [scheduledFireAt.length, activeMoment])

  useEffect(() => {
    if (!onWatchHintChange) return

    if (activeMoment) {
      onWatchHintChange('Big moment — look at your screen')
      return
    }

    const nextFire = scheduledFireAt[0]
    if (nextFire) {
      const seconds = Math.max(0, Math.ceil((nextFire - Date.now()) / 1000))
      if (seconds > 0) {
        onWatchHintChange(`Heads-up in ${seconds}s — something big may be coming`)
      } else {
        onWatchHintChange('Big moment — look at your screen')
      }
      return
    }

    onWatchHintChange(null)
  }, [activeMoment, scheduledFireAt, tick, onWatchHintChange])

  const { totalSeconds: liveTotalSeconds, display: liveGameClockDisplay } = useLiveGameClock(
    currentMinute,
    currentExtra
  )

  useEffect(() => {
    onDisplayUpdate?.({
      matchStatus,
      goals,
      currentMinute,
      currentExtra,
    })
  }, [matchStatus, goals, currentMinute, currentExtra, onDisplayUpdate])

  return (
    <>
      {activeMoment && (
        <AlertOverlay
          moment={activeMoment}
          countdownSeconds={activeCountdown}
          onDismiss={() => setActiveMoment(null)}
        />
      )}

      <div className="flex flex-col gap-6">
        <SyncWidget
          liveTotalSeconds={liveTotalSeconds}
          liveDisplay={liveGameClockDisplay}
          matchStatus={matchStatus}
          delaySeconds={delaySeconds}
          onChange={onDelayChange}
        />

        <HeadsUpPicker
          delaySeconds={delaySeconds}
          headsUpSeconds={headsUpSeconds}
          onChange={onHeadsUpChange}
        />

        <AlertSoundToggle />
      </div>
    </>
  )
}
