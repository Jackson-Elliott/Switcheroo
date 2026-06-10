'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import GameSelector from '@/components/GameSelector'
import ServicePicker from '@/components/ServicePicker'
import MatchWatcher from '@/components/MatchWatcher'
import MatchScoreCard, { type MatchDisplayState } from '@/components/MatchScoreCard'
import HowItWorks from '@/components/HowItWorks'
import BackgroundAlertsRestoreButton from '@/components/BackgroundAlertsRestoreButton'
import AuthorCreditLink from '@/components/AuthorCreditLink'
import {
  dismissBackgroundAlerts,
  hasSeenStep3Intro,
  isBackgroundAlertsDismissed,
  markStep3IntroSeen,
} from '@/lib/background-alerts'
import { requestNotificationPermission } from '@/lib/notifications'
import {
  clearWatchSession,
  loadWatchSession,
  resolveSessionService,
  saveWatchSession,
  type SetupStep,
} from '@/lib/session'
import { type StreamingService } from '@/lib/services'
import type { Fixture } from '@/lib/api'
import { boldonse } from '@/lib/fonts'

export default function Home() {
  const [hydrated, setHydrated] = useState(false)
  const [activeStep, setActiveStep] = useState<SetupStep>(1)
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null)
  const [selectedService, setSelectedService] = useState<StreamingService | null>(null)
  const [delaySeconds, setDelaySeconds] = useState(50)
  const [headsUpSeconds, setHeadsUpSeconds] = useState(50)
  const [matchDisplay, setMatchDisplay] = useState<MatchDisplayState | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const prevActiveStep = useRef<SetupStep>(1)

  useEffect(() => {
    const session = loadWatchSession()
    if (session) {
      const service = resolveSessionService(session.serviceId)
      if (service) {
        setSelectedFixture(session.fixture)
        setSelectedService(service)
        setDelaySeconds(session.delaySeconds)
        setHeadsUpSeconds(session.headsUpSeconds)
        setActiveStep(session.activeStep)
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !selectedFixture || !selectedService || activeStep !== 3) return
    saveWatchSession({
      activeStep,
      fixture: selectedFixture,
      serviceId: selectedService.id,
      delaySeconds,
      headsUpSeconds,
    })
  }, [hydrated, activeStep, selectedFixture, selectedService, delaySeconds, headsUpSeconds])

  useEffect(() => {
    if (prevActiveStep.current === 3 && activeStep !== 3) {
      markStep3IntroSeen()
    }

    if (activeStep === 3 && hasSeenStep3Intro() && !isBackgroundAlertsDismissed()) {
      dismissBackgroundAlerts()
    }

    prevActiveStep.current = activeStep
  }, [activeStep])

  const handleMatchDisplayUpdate = useCallback((display: MatchDisplayState) => {
    setMatchDisplay(display)
  }, [])

  const handleDemoChange = useCallback((demo: boolean) => {
    setIsDemo(demo)
  }, [])

  function handleSelectFixture(fixture: Fixture) {
    setSelectedFixture(fixture)
    setSelectedService(null)
    setActiveStep(2)
  }

  async function handleSelectService(service: StreamingService) {
    setSelectedService(service)
    setDelaySeconds(service.delaySeconds)
    setHeadsUpSeconds(Math.min(service.delaySeconds, 30))
    await requestNotificationPermission()
    setActiveStep(3)
  }

  function handleChangeStep1() {
    clearWatchSession()
    setSelectedFixture(null)
    setSelectedService(null)
    setMatchDisplay(null)
    setActiveStep(1)
  }

  function handleChangeStep2() {
    setSelectedService(null)
    setActiveStep(2)
  }

  const step1Complete = selectedFixture !== null && activeStep > 1
  const step2Complete = selectedService !== null && activeStep > 2

  if (!hydrated) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex max-w-lg items-center justify-center px-4 pt-32">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-zesty/80" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {isDemo && (
        <div className="glass glass-warning !fixed top-4 left-4 z-50 w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
          Demo mode
        </div>
      )}
      <div className="mx-auto max-w-lg px-4 pt-14 pb-16 sm:pt-16">
        {activeStep < 3 ? (
          <Header onHome={handleChangeStep1} />
        ) : (
          <Header minimal onHome={handleChangeStep1} />
        )}

        {activeStep < 3 && <HowItWorks />}

        <div className="flex flex-col gap-3">
          <SetupStep
            number={1}
            title="What are you watching?"
            status={activeStep === 1 ? 'active' : step1Complete ? 'complete' : 'locked'}
            collapsedContent={
              selectedFixture ? (
                <MatchScoreCard
                  fixture={selectedFixture}
                  matchStatus={matchDisplay?.matchStatus ?? selectedFixture.fixture.status.short}
                  goals={matchDisplay?.goals ?? selectedFixture.goals}
                  currentMinute={
                    matchDisplay?.currentMinute ?? selectedFixture.fixture.status.elapsed
                  }
                  currentExtra={matchDisplay?.currentExtra ?? selectedFixture.fixture.status.extra}
                  onChange={handleChangeStep1}
                  compact
                />
              ) : null
            }
          >
            <GameSelector onSelect={handleSelectFixture} onDemoChange={handleDemoChange} />
          </SetupStep>

          <SetupStep
            number={2}
            title="What are you watching on?"
            subtitle="Sets your stream delay automatically"
            status={
              activeStep < 2 ? 'locked' : activeStep === 2 ? 'active' : step2Complete ? 'complete' : 'locked'
            }
            summary={
              selectedService ? (
                <>
                  {selectedService.logo} {selectedService.name}
                  <span className="text-white/40">
                    {' '}
                    · {selectedService.type === 'paused' ? 'Custom delay' : `~${selectedService.delaySeconds}s delay`}
                  </span>
                </>
              ) : null
            }
            onChange={step2Complete ? handleChangeStep2 : undefined}
          >
            <ServicePicker onSelect={handleSelectService} />
          </SetupStep>

          {activeStep >= 3 && <BackgroundAlertsRestoreButton />}

          <SetupStep
            number={3}
            title="Watch for big moments"
            status={activeStep < 3 ? 'locked' : 'active'}
          >
            {selectedFixture && selectedService && (
              <MatchWatcher
                fixture={selectedFixture}
                delaySeconds={delaySeconds}
                headsUpSeconds={headsUpSeconds}
                isDemo={isDemo}
                onDelayChange={setDelaySeconds}
                onHeadsUpChange={setHeadsUpSeconds}
                onDisplayUpdate={handleMatchDisplayUpdate}
              />
            )}
          </SetupStep>
        </div>

        <footer className="mx-auto mt-10 max-w-md text-center">
          <p className="text-[11px] leading-relaxed text-white/35">
            Built for people who take football extremely seriously and work… moderately
            seriously. Switcheroo watches the boring bits so you can look busy until something
            worth switching tabs for actually happens.
          </p>
          <p className="mt-2 text-[10px] leading-relaxed text-white/25">
            Not affiliated with FIFA, the World Cup, or your manager&apos;s belief that you
            are &ldquo;fully present&rdquo; in this meeting.
          </p>
          <p className="mt-4">
            <AuthorCreditLink />
          </p>
        </footer>
      </div>
    </main>
  )
}

function Header({
  minimal = false,
  onHome,
}: {
  minimal?: boolean
  onHome?: () => void
}) {
  const titleClass = minimal
    ? `${boldonse.className} text-2xl font-normal uppercase leading-none tracking-tight text-[#CCFF00]`
    : `${boldonse.className} text-[2.75rem] font-normal uppercase leading-[0.95] tracking-tight text-[#CCFF00] sm:text-5xl`

  const taglineClass = minimal
    ? 'font-sans mt-1 text-[13.225px] font-normal tracking-wide text-white/50 group-hover:text-white/70'
    : 'font-sans mt-3 text-[12px] font-medium tracking-wide text-white group-hover:text-white sm:text-[1.08rem]'

  const brand = (
    <>
      <h1 className={`${titleClass} tm-title group-hover:text-[#CCFF00]/90`}>Switcheroo</h1>
      <p className={taglineClass}>Get alerted before the big moments hit your screen</p>
    </>
  )

  if (minimal) {
    return (
      <header className="tm-header mb-6 text-center">
        <div className="tm-header-glow" aria-hidden />
        {onHome ? (
          <button
            type="button"
            onClick={onHome}
            className="group mx-auto block transition-opacity hover:opacity-95"
          >
            {brand}
          </button>
        ) : (
          brand
        )}
      </header>
    )
  }

  return (
    <header className="tm-header mb-8 text-center">
      <div className="tm-header-glow" aria-hidden />
      {onHome ? (
        <button
          type="button"
          onClick={onHome}
          className="group mx-auto block transition-opacity hover:opacity-95"
        >
          {brand}
        </button>
      ) : (
        brand
      )}
      <p className="mx-auto mt-4 max-w-[36rem] text-xs font-normal leading-[1.92] text-white/55">
        Switcheroo is like that unemployed mate who watches every World Cup game while
        you&apos;re stuck at work, then alerts you whenever something worth watching is
        about to happen. Meaning you can work through the boring bits and Switcheroo for the
        important moments.
      </p>
    </header>
  )
}

type StepStatus = 'locked' | 'active' | 'complete'

function SetupStep({
  number,
  title,
  subtitle,
  status,
  summary,
  collapsedContent,
  onChange,
  children,
}: {
  number: number
  title: string
  subtitle?: string
  status: StepStatus
  summary?: React.ReactNode
  collapsedContent?: React.ReactNode
  onChange?: () => void
  children: React.ReactNode
}) {
  if (status === 'complete' && collapsedContent) {
    return <>{collapsedContent}</>
  }

  if (status === 'complete' && summary) {
    return (
      <CollapsedStepSummary onChange={onChange}>{summary}</CollapsedStepSummary>
    )
  }

  if (status === 'locked') {
    return (
      <div className="glass rounded-xl px-4 py-3 opacity-45">
        <StepHeading number={number} title={title} subtitle={subtitle} muted />
      </div>
    )
  }

  return (
    <div className="glass glass-temporal rounded-2xl p-5">
      <div className="mb-5">
        <StepHeading number={number} title={title} subtitle={subtitle} />
      </div>
      {children}
    </div>
  )
}

function StepHeading({
  number,
  title,
  subtitle,
  muted = false,
}: {
  number: number
  title: string
  subtitle?: string
  muted?: boolean
}) {
  return (
    <>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`glass-badge grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold leading-none tabular-nums ${
              muted ? 'text-white/35' : 'text-zesty'
            }`}
          >
            {number}
          </span>
          <h2 className={`text-lg font-bold ${muted ? 'text-white/45' : 'text-white'}`}>{title}</h2>
        </div>
      </div>
      {subtitle && <p className={`pl-7 text-sm ${muted ? 'text-white/30' : 'text-white/45'}`}>{subtitle}</p>}
    </>
  )
}

function CollapsedStepSummary({
  children,
  onChange,
}: {
  children: React.ReactNode
  onChange?: () => void
}) {
  return (
    <div className="glass flex w-full items-center justify-between rounded-xl px-4 py-2.5 glass-temporal">
      <div className="min-w-0 text-sm font-medium text-white/85">{children}</div>
      {onChange && (
        <button
          type="button"
          onClick={onChange}
          className="glass-chip ml-auto shrink-0 rounded-md px-2 py-0.5 text-[10px] text-white/45 hover:text-white"
        >
          Change
        </button>
      )}
    </div>
  )
}
