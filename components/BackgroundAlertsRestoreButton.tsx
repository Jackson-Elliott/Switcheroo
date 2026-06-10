'use client'

import { useEffect, useState } from 'react'
import {
  isBackgroundAlertsDismissed,
  restoreBackgroundAlerts,
  subscribeBackgroundAlertsChange,
} from '@/lib/background-alerts'

const chipClassName =
  'glass-chip shrink-0 rounded-md px-2 py-0.5 text-[10px] text-white/45 hover:text-white'

export default function BackgroundAlertsRestoreButton() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(isBackgroundAlertsDismissed())
    return subscribeBackgroundAlertsChange(() => {
      setDismissed(isBackgroundAlertsDismissed())
    })
  }, [])

  if (!dismissed) return null

  return (
    <div className="glass flex items-center justify-between rounded-xl px-4 py-2.5 glass-temporal">
      <div className="min-w-0 text-sm font-medium text-white/85">Background alerts</div>
      <button type="button" onClick={restoreBackgroundAlerts} className={chipClassName}>
        Test notification
      </button>
    </div>
  )
}
