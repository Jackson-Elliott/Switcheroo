export function getEffectiveHeadsUp(delaySeconds: number, headsUpSeconds: number): number {
  if (delaySeconds <= 0) return 0
  return Math.min(Math.max(headsUpSeconds, 0), delaySeconds)
}

export function getNotificationWaitMs(delaySeconds: number, headsUpSeconds: number): number {
  const headsUp = getEffectiveHeadsUp(delaySeconds, headsUpSeconds)
  return Math.max(0, (delaySeconds - headsUp) * 1000)
}

export function formatDuration(seconds: number): string {
  if (seconds <= 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins} min`
  return `${mins} min ${secs} sec`
}
