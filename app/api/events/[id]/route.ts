import { NextResponse } from 'next/server'
import { getDemoFixtureWithEvents, isDemoMode } from '@/lib/demo-data'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(req.url)
  const watchStartTime = parseInt(url.searchParams.get('t') ?? '0') || Date.now()

  if (isDemoMode()) {
    const fixture = getDemoFixtureWithEvents(parseInt(id), watchStartTime)
    return NextResponse.json({ response: [fixture], demo: true })
  }

  const key = process.env.API_FOOTBALL_KEY

  try {
    const [fixtureRes, statsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
        headers: { 'x-apisports-key': key! },
        next: { revalidate: 15 },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`, {
        headers: { 'x-apisports-key': key! },
        next: { revalidate: 15 },
      }),
    ])

    if (!fixtureRes.ok) {
      return NextResponse.json({ error: 'API error', status: fixtureRes.status }, { status: 502 })
    }

    const data = await fixtureRes.json()
    const fixture = data.response?.[0]
    if (!fixture) {
      return NextResponse.json(data)
    }

    if (statsRes.ok) {
      const statsData = await statsRes.json()
      fixture.statistics = statsData.response ?? fixture.statistics
    }

    return NextResponse.json({ ...data, response: [fixture] })
  } catch (err) {
    console.error('Events fetch error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
