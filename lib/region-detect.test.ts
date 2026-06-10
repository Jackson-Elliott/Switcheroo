import { describe, expect, it } from 'vitest'
import { detectDefaultRegionId } from './region-detect'

describe('region-detect', () => {
  it('maps known timezones to regions', () => {
    expect(detectDefaultRegionId('Australia/Sydney')).toBe('au')
    expect(detectDefaultRegionId('America/New_York')).toBe('us')
    expect(detectDefaultRegionId('Europe/London')).toBe('uk')
  })

  it('falls back sensibly for unknown zones', () => {
    expect(detectDefaultRegionId('Pacific/Unknown')).toBeTruthy()
  })
})
