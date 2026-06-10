'use client'

import { useEffect, useState } from 'react'
import { detectTimeZone, getTimezoneAbbreviation } from '@/lib/timezone'

export function useUserTimezone() {
  const [timeZone, setTimeZone] = useState('UTC')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTimeZone(detectTimeZone())
    setReady(true)
  }, [])

  const label = ready ? getTimezoneAbbreviation(timeZone) : ''

  return { timeZone, ready, label }
}
