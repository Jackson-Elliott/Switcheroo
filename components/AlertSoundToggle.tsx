'use client'

import { useEffect, useState } from 'react'
import {
  getAlertSoundEnabled,
  preloadAlertSound,
  setAlertSoundEnabled,
} from '@/lib/notifications'

export default function AlertSoundToggle() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(getAlertSoundEnabled())
  }, [])

  return (
    <label className="glass-inset flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => {
          const next = e.target.checked
          setEnabled(next)
          setAlertSoundEnabled(next)
          if (next) preloadAlertSound()
        }}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/30 bg-white/10 accent-[#CCFF00]"
      />
      <span>
        <span className="block text-sm font-medium text-white/85">Alert sound</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/45">
          Play a short stadium crowd cheer when an alert fires
        </span>
      </span>
    </label>
  )
}
