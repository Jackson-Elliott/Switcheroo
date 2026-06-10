'use client'

import { useState } from 'react'
import { REGIONS, PAUSED_TV_SERVICE, OTHER_SERVICE, type StreamingService } from '@/lib/services'

type Props = {
  onSelect: (service: StreamingService) => void
}

export default function ServicePicker({ onSelect }: Props) {
  const [activeRegion, setActiveRegion] = useState('au')
  const currentRegion = REGIONS.find((r) => r.id === activeRegion) ?? REGIONS[0]

  return (
    <div className="space-y-6">
      <section>
        <SectionLabel>Region</SectionLabel>
        <div className="glass-inset max-h-36 overflow-y-auto rounded-xl p-2.5 sm:max-h-none sm:overflow-visible sm:p-2">
          <div className="flex flex-wrap gap-2 sm:gap-1">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setActiveRegion(region.id)}
                aria-pressed={activeRegion === region.id}
                aria-label={region.name}
                className={`flex items-center justify-center rounded-xl px-3 py-2.5 text-2xl leading-none transition-all duration-150 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs sm:leading-normal ${
                  activeRegion === region.id
                    ? 'glass-chip-active bg-white/14 text-white'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                <span className="sm:mr-1">{region.flag}</span>
                <span className="hidden text-xs font-medium sm:inline">{region.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>
          {currentRegion.flag} Stream in {currentRegion.name}
        </SectionLabel>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {currentRegion.services.map((service) => (
            <ServiceButton key={service.id} service={service} onSelect={onSelect} variant="primary" />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel muted>Something else</SectionLabel>
        <div className="space-y-2">
          <ServiceButton service={PAUSED_TV_SERVICE} onSelect={onSelect} variant="secondary" />
          <ServiceButton service={OTHER_SERVICE} onSelect={onSelect} variant="secondary" />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-white/35">
          Paused TV is nearly live — set your pause length on the next step.
        </p>
      </section>
    </div>
  )
}

function SectionLabel({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      className={`mb-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
        muted ? 'text-white/35' : 'text-white/55'
      }`}
    >
      {children}
    </div>
  )
}

function ServiceButton({
  service,
  onSelect,
  variant,
}: {
  service: StreamingService
  onSelect: (s: StreamingService) => void
  variant: 'primary' | 'secondary'
}) {
  const delayLabel =
    service.type === 'paused' ? 'Custom delay' : `~${service.delaySeconds}s delay`

  if (variant === 'secondary') {
    return (
      <button
        type="button"
        onClick={() => onSelect(service)}
        className="group glass-inset flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-lg leading-none">{service.logo}</span>
          <span className="truncate text-sm text-white/75">{service.name}</span>
        </div>
        <span className="shrink-0 text-[11px] text-white/40 group-hover:text-white/60">{delayLabel}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className="group glass glass-interactive flex w-full items-center gap-3 rounded-xl p-4 text-left"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl glass-inset text-2xl leading-none">
        {service.logo}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white leading-tight">{service.name}</div>
        <div className="mt-0.5 text-xs text-white/45">{delayLabel}</div>
      </div>
      <span className="shrink-0 text-sm text-white/25 transition-colors group-hover:text-white/55">→</span>
    </button>
  )
}
