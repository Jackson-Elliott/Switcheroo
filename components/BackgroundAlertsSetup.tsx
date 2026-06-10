'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  dismissBackgroundAlerts,
  isBackgroundAlertsDismissed,
  subscribeBackgroundAlertsChange,
} from '@/lib/background-alerts'
import {
  getNotificationPermissionState,
  runTestAlert,
  type TestAlertResult,
} from '@/lib/notifications'

type PermissionState = ReturnType<typeof getNotificationPermissionState>

export default function BackgroundAlertsSetup() {
  const [permission, setPermission] = useState<PermissionState | null>(null)
  const [testResult, setTestResult] = useState<TestAlertResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const refreshPermission = useCallback(() => {
    setPermission(getNotificationPermissionState())
  }, [])

  const syncDismissed = useCallback(() => {
    setDismissed(isBackgroundAlertsDismissed())
  }, [])

  useEffect(() => {
    syncDismissed()
    refreshPermission()
    return subscribeBackgroundAlertsChange(() => {
      syncDismissed()
      refreshPermission()
    })
  }, [refreshPermission, syncDismissed])

  async function handleTestAlert() {
    setTesting(true)
    setTestResult(null)
    const result = await runTestAlert()
    refreshPermission()
    setTestResult(result)
    setTesting(false)
    if (result === 'sent') {
      dismissBackgroundAlerts()
    }
  }

  if (permission === null || dismissed) return null

  return (
    <div className="glass glass-sky space-y-4 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-white/90">Background alerts</div>
          <p className="mt-1 text-xs leading-relaxed text-white/45">
            Work in other tabs — we&apos;ll ping you when something big is about to hit your
            screen.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissBackgroundAlerts}
          aria-label="Dismiss background alerts help"
          className="glass-chip grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm leading-none text-white/45 transition-colors hover:text-white"
        >
          ×
        </button>
      </div>

      <ul className="space-y-2 text-xs leading-relaxed text-white/55">
        <li className="flex gap-2">
          <span className="shrink-0 text-zesty" aria-hidden>
            •
          </span>
          <span>
            <strong className="font-medium text-white/75">Allow notifications</strong> —
            that&apos;s how we reach you outside this tab.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-zesty" aria-hidden>
            •
          </span>
          <span>
            <strong className="font-medium text-white/75">Keep this tab open</strong> — it can
            sit in the background, but don&apos;t close it.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-zesty" aria-hidden>
            •
          </span>
          <span>
            Switch to another tab and run a test below to confirm alerts work before kickoff.
          </span>
        </li>
      </ul>

      {permission === 'unsupported' && (
        <p className="text-xs leading-relaxed text-amber-200/90">
          This browser doesn&apos;t support background notifications. Keep Switcheroo visible
          to see full-screen alerts.
        </p>
      )}

      {permission === 'denied' && (
        <p className="glass glass-danger rounded-lg px-3 py-2 text-xs leading-relaxed text-red-200/90">
          Notifications are blocked. Enable them in your browser settings, then refresh this
          page.
        </p>
      )}

      {permission === 'default' && (
        <p className="glass glass-warning rounded-lg px-3 py-2 text-xs leading-relaxed text-amber-200/90">
          Notifications aren&apos;t enabled yet. Allow them so we can alert you in other tabs.
        </p>
      )}

      {permission !== 'unsupported' && permission !== 'denied' && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleTestAlert}
            disabled={testing}
            className="glass-btn rounded-lg px-4 py-2 text-sm font-semibold text-white/90 disabled:opacity-50"
          >
            {testing ? 'Sending…' : 'Test notification'}
          </button>

          {testResult === 'blocked' && (
            <p className="text-xs text-amber-200/90">
              Couldn&apos;t send — allow notifications and try again.
            </p>
          )}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-white/35">
        In other tabs, your OS plays the notification sound. Your chosen alert sound plays when
        you&apos;re on this tab.
      </p>
    </div>
  )
}
