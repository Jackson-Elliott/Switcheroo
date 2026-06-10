export function detectTimeZone(): string {
  if (typeof window === 'undefined') return 'UTC'
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

export function getCalendarDay(date: Date, timeZone?: string): string {
  if (timeZone) {
    return date.toLocaleDateString('en-CA', { timeZone })
  }
  return date.toLocaleDateString('en-CA')
}

export function formatLocalDateISO(date: Date, timeZone: string): string {
  return getCalendarDay(date, timeZone)
}

export function addDaysToLocalDate(date: Date, days: number, timeZone: string): string {
  return formatLocalDateISO(new Date(date.getTime() + days * 86_400_000), timeZone)
}

export function getTimezoneAbbreviation(timeZone: string, date = new Date()): string {
  const part = new Intl.DateTimeFormat(undefined, {
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')

  return part?.value ?? timeZone
}

export function formatKickoffTime(isoDate: string, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  }
  if (timeZone) options.timeZone = timeZone
  return new Date(isoDate).toLocaleTimeString(undefined, options)
}

export function formatRelativeDateLabel(
  kickoff: Date,
  now: Date,
  timeZone?: string
): string {
  const kickoffDay = getCalendarDay(kickoff, timeZone)
  const today = getCalendarDay(now, timeZone)
  const tomorrow = getCalendarDay(new Date(now.getTime() + 86_400_000), timeZone)

  if (kickoffDay === today) return 'Today'
  if (kickoffDay === tomorrow) return 'Tomorrow'

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }
  if (timeZone) dateOptions.timeZone = timeZone
  return kickoff.toLocaleDateString(undefined, dateOptions)
}

export function formatKickoffDateTime(isoDate: string, timeZone?: string): string {
  const kickoff = new Date(isoDate)
  const dateLabel = formatRelativeDateLabel(kickoff, new Date(), timeZone)
  const time = formatKickoffTime(isoDate, timeZone)
  return `${dateLabel} · ${time}`
}

export function formatKickoffDate(isoDate: string, timeZone: string): string {
  return formatRelativeDateLabel(new Date(isoDate), new Date(), timeZone)
}

export function isSameCalendarDayInTimeZone(a: Date, b: Date, timeZone: string): boolean {
  return getCalendarDay(a, timeZone) === getCalendarDay(b, timeZone)
}
