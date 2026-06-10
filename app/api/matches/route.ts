import { NextResponse } from 'next/server'
import { DEMO_FIXTURES, isDemoMode } from '@/lib/demo-data'
import { addDaysToLocalDate, formatLocalDateISO } from '@/lib/timezone'

export async function GET(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ response: DEMO_FIXTURES, demo: true })
  }

  const key = process.env.API_FOOTBALL_KEY
  const timeZone = new URL(req.url).searchParams.get('tz') || 'UTC'

  try {
    const now = new Date()
    const today = formatLocalDateISO(now, timeZone)
    const horizon = addDaysToLocalDate(now, 60, timeZone)

    const scheduleRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=${today}&to=${horizon}`,
      { headers: { 'x-apisports-key': key! }, next: { revalidate: 30 } }
    )
    const scheduleData = await scheduleRes.json()

    if (!scheduleData.errors?.plan && Array.isArray(scheduleData.response)) {
      const fixtures = scheduleData.response.filter(
        (f: { fixture: { status: { short: string } } }) =>
          !['FT', 'AET', 'PEN', 'AWD', 'WO', 'CANC', 'ABD'].includes(f.fixture.status.short)
      )

      return NextResponse.json({
        ...scheduleData,
        response: fixtures,
        no_schedule: fixtures.length === 0,
      })
    }

    const liveRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?live=all`,
      { headers: { 'x-apisports-key': key! }, next: { revalidate: 15 } }
    )
    const liveData = await liveRes.json()
    const wcFixtures = (liveData.response ?? []).filter(
      (f: { league: { id: number } }) => f.league.id === 1
    )

    return NextResponse.json({
      response: wcFixtures,
      free_plan: true,
      no_schedule: wcFixtures.length === 0,
    })
  } catch (err) {
    console.error('Matches fetch error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
