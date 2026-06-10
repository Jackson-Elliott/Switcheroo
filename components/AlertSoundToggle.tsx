'use client'

import { useEffect, useState } from 'react'
import {
  getAlertSoundEnabled,
  getAlertSoundType,
  preloadAlertSound,
  previewAlertSound,
  setAlertSoundEnabled,
  setAlertSoundType,
  type AlertSoundType,
} from '@/lib/notifications'

const SOUND_OPTIONS: { id: AlertSoundType; label: string; description: string }[] = [
  {
    id: 'crowd',
    label: 'Crowd cheer',
    description: 'Random stadium roar',
  },
  {
    id: 'ding',
    label: 'Ding',
    description: 'Sharp alert chime',
  },
]

export default function AlertSoundToggle() {
  const [enabled, setEnabled] = useState(true)
  const [soundType, setSoundType] = useState<AlertSoundType>('crowd')

  useEffect(() => {
    setEnabled(getAlertSoundEnabled())
    setSoundType(getAlertSoundType())
  }, [])

  function handleEnabledChange(next: boolean) {
    setEnabled(next)
    setAlertSoundEnabled(next)
    if (next) preloadAlertSound()
  }

  function handleSoundTypeChange(next: AlertSoundType) {
    setSoundType(next)
    setAlertSoundType(next)
    if (enabled) {
      if (next === 'crowd') preloadAlertSound()
      previewAlertSound(next)
    }
  }

  return (
    <div className="glass-inset space-y-4 rounded-xl px-4 py-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleEnabledChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/30 bg-white/10 accent-[#CCFF00]"
        />
        <span>
          <span className="block text-sm font-medium text-white/85">Alert sound</span>
        </span>
      </label>

      {enabled && (
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
            {SOUND_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSoundTypeChange(option.id)}
                className={`w-full rounded-lg px-3 py-2 text-center transition-all duration-150 ${
                  soundType === option.id
                    ? 'glass-chip glass-chip-active text-zesty'
                    : 'glass-chip text-white/55 hover:text-white/80'
                }`}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 block text-[11px] text-white/40">{option.description}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
