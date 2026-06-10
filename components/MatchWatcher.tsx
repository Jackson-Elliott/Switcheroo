'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLiveGameClock } from '@/hooks/useLiveGameClock'
import { fetchFixtureWithEvents, type Fixture } from '@/lib/api'
import {
  extractNewBigChanceEvents,
  seedBigChanceCounts,
} from '@/lib/big-chances'
import { classifyEvent, createDemoAlert, getEventKey, type BigMoment } from '@/lib/events'
import { fireBrowserNotification, getAlertSoundEnabled, playAlertSound, preloadAlertSound } from '@/lib/notifications'
import { getEffectiveHeadsUp, getNotificationWaitMs } from '@/lib/timing'
import AlertOverlay from './AlertOverlay'
import AlertSoundToggle from './AlertSoundToggle'
import BackgroundAlertsSetup from './BackgroundAlertsSetup'
import HeadsUpPicker from './HeadsUpPicker'
import PreMatchCountdown from './PreMatchCountdown'
import SyncWidget from './SyncWidget'

import { type MatchDisplayState } from './MatchScoreCard'

const POLL_INTERVAL_VISIBLE_MS = 5_000
const POLL_INTERVAL_HIDDEN_MS = 3_000

type Props = {
  fixture: Fixture
  delaySeconds: number
  headsUpSeconds: number
  isDemo?: boolean
  onDelayChange: (seconds: number) => void
  onHeadsUpChange: (seconds: number) => void
  onDisplayUpdate?: (display: MatchDisplayState) => void
}

export default function MatchWatcher({
  fixture,
  delaySeconds,
  headsUpSeconds,
  isDemo = false,
  onDelayChange,
  onHeadsUpChange,
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
  const [isTabHidden, setIsTabHidden] = useState(false)

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

  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
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
    const intervalMs = isTabHidden ? POLL_INTERVAL_HIDDEN_MS : POLL_INTERVAL_VISIBLE_MS
    const interval = setInterval(poll, intervalMs)
    return () => {
      clearInterval(interval)
      pendingAlerts.current.forEach(clearTimeout)
      pendingAlerts.current.clear()
      setScheduledFireAt([])
    }
  }, [poll, isTabHidden])

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

  function handleDemoAlert() {
    const moment = createDemoAlert()
    const countdown = getEffectiveHeadsUp(delaySeconds, headsUpSeconds)
    triggerAlert(moment, countdown)
  }

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
        <PreMatchCountdown fixture={fixture} matchStatus={matchStatus} />

        <BackgroundAlertsSetup />

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

        {isDemo && (
          <button
            type="button"
            onClick={handleDemoAlert}
            className="glass glass-warning w-full rounded-xl px-4 py-3 text-sm font-semibold text-amber-100/90"
          >
            Simulate demo alert
          </button>
        )}
      </div>
    </>
  )
}
