'use client'

import { useEffect, useState } from 'react'

const DISMISS_KEY = 'switcheroo-how-it-works-dismissed'

export default function HowItWorks() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(localStorage.getItem(DISMISS_KEY) !== 'true')
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="glass glass-emerald mb-4 rounded-2xl p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-bold text-white/90">How Switcheroo works</h2>
        <button
          type="button"
          onClick={dismiss}
          className="glass-chip shrink-0 rounded-md px-2 py-0.5 text-[10px] text-white/45 hover:text-white"
        >
          Got it
        </button>
      </div>

      <ol className="space-y-3 text-xs leading-relaxed text-white/55">
        <li className="flex gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full glass-badge text-[10px] font-bold text-zesty">
            1
          </span>
          <span>
            <strong className="text-white/75">Pick your match</strong> — we watch live data so
            you don&apos;t have to.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full glass-badge text-[10px] font-bold text-zesty">
            2
          </span>
          <span>
            <strong className="text-white/75">Set your stream delay</strong> — sync the clocks
            so alerts land before the action on your screen.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full glass-badge text-[10px] font-bold text-zesty">
            3
          </span>
          <span>
            <strong className="text-white/75">Work in other tabs</strong> — we alert you before
            big moments. No score spoilers, ever.
          </span>
        </li>
      </ol>
    </div>
  )
}
