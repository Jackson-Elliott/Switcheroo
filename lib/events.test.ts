import { describe, expect, it } from 'vitest'
import { classifyEvent, getEventKey } from './events'
import { DEFAULT_ALERT_PREFERENCES } from './alert-preferences'

describe('events', () => {
  const goalEvent = {
    time: { elapsed: 23, extra: null },
    team: { id: 1, name: 'Brazil', logo: '🇧🇷' },
    player: { id: 9, name: 'Test Player' },
    assist: { id: null, name: null },
    type: 'Goal',
    detail: 'Normal Goal',
    comments: null,
  }

  it('classifies goals as critical with generic copy', () => {
    const moment = classifyEvent(goalEvent, DEFAULT_ALERT_PREFERENCES)
    expect(moment).not.toBeNull()
    expect(moment!.level).toBe('critical')
    expect(moment!.headline).toBe('BIG MOMENT')
    expect(moment!.subtext).not.toContain('Goal')
    expect(moment!.notificationTitle).toBe('Big moment — look at your screen')
  })

  it('respects disabled preferences', () => {
    const moment = classifyEvent(goalEvent, { ...DEFAULT_ALERT_PREFERENCES, goals: false })
    expect(moment).toBeNull()
  })

  it('builds stable event keys', () => {
    expect(getEventKey(goalEvent)).toBe('23-Goal-Normal Goal-Test Player')
  })
})
