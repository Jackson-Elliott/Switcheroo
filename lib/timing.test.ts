import { describe, expect, it } from 'vitest'
import { getEffectiveHeadsUp, getNotificationWaitMs } from './timing'

describe('timing', () => {
  it('caps heads-up at delay', () => {
    expect(getEffectiveHeadsUp(50, 60)).toBe(50)
    expect(getEffectiveHeadsUp(50, 30)).toBe(30)
  })

  it('returns zero heads-up when delay is zero', () => {
    expect(getEffectiveHeadsUp(0, 30)).toBe(0)
  })

  it('computes notification wait from delay minus heads-up', () => {
    expect(getNotificationWaitMs(50, 30)).toBe(20_000)
    expect(getNotificationWaitMs(50, 50)).toBe(0)
  })
})
