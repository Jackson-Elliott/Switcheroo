import { formatLiveClock } from '@/hooks/useLiveGameClock'

type Props = {
  totalSeconds: number
  className?: string
}

export default function LiveClockDisplay({ totalSeconds, className = '' }: Props) {
  return (
    <span
      className={`inline-block min-w-[6ch] text-center font-black leading-none tracking-tight ${className}`}
    >
      {formatLiveClock(totalSeconds)}
    </span>
  )
}
