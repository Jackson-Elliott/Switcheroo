# Switcheroo

Get alerted before big World Cup moments hit your delayed stream — without score spoilers.

## Setup

1. Copy env file and add your API key:

```bash
cp .env.local.example .env.local
```

2. Set `API_FOOTBALL_KEY` in `.env.local`, or use `API_FOOTBALL_KEY=demo` for demo mode.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. Pick a live (or starting soon) match
2. Choose your streaming service — sets an estimated delay
3. Sync the delay slider to match your stream clock
4. Work in other tabs — Switcheroo polls live data and sends browser notifications before big moments reach your screen

**Important:** Keep the Switcheroo tab open (it can be in the background). Allow browser notifications for alerts in other tabs.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Environment

| Variable | Description |
|----------|-------------|
| `API_FOOTBALL_KEY` | [API-Football](https://www.api-football.com/) key, or `demo` for local demo data |

## Architecture

- **Next.js App Router** — UI and API proxy routes
- **`/api/matches`** — today's/live fixtures
- **`/api/events/[id]`** — fixture events + statistics for big-chance detection
- **Client polling** — 5s interval (3s when tab is backgrounded)
- **Alert timing** — `delaySeconds - headsUpSeconds` after a live event before firing

## Demo mode

Set `API_FOOTBALL_KEY=demo` to use fake fixtures and simulated events without an API key.
