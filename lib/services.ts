export type StreamingService = {
  id: string
  name: string
  delaySeconds: number
  logo: string
  type: 'broadcast' | 'streaming' | 'cable' | 'paused'
}

export type Region = {
  id: string
  name: string
  flag: string
  services: StreamingService[]
}

export const REGIONS: Region[] = [
  {
    id: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    services: [
      { id: 'sbs-tv', name: 'SBS TV', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'sbs-ondemand', name: 'SBS On Demand', delaySeconds: 50, logo: '📱', type: 'streaming' },
      { id: 'foxtel', name: 'Foxtel', delaySeconds: 25, logo: '🦊', type: 'cable' },
    ],
  },
  {
    id: 'nz',
    name: 'New Zealand',
    flag: '🇳🇿',
    services: [
      { id: 'tvnz-tv', name: 'TVNZ (broadcast)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'tvnz-plus', name: 'TVNZ+', delaySeconds: 45, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'in',
    name: 'India',
    flag: '🇮🇳',
    services: [
      { id: 'unite8', name: 'Unite8 Sports (TV)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'zee5', name: 'Zee5', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: '🇯🇵',
    services: [
      { id: 'nhk', name: 'NHK', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'dazn-jp', name: 'DAZN Japan', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'kr',
    name: 'South Korea',
    flag: '🇰🇷',
    services: [
      { id: 'kbs', name: 'KBS', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'jtbc', name: 'JTBC NOW', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'cn',
    name: 'China',
    flag: '🇨🇳',
    services: [
      { id: 'cctv', name: 'CCTV', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'migu', name: 'Migu', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'sg',
    name: 'Singapore',
    flag: '🇸🇬',
    services: [
      { id: 'mediacorp-tv', name: 'Mediacorp (Channel 5)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'mewatch', name: 'meWATCH', delaySeconds: 45, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'ph',
    name: 'Philippines',
    flag: '🇵🇭',
    services: [
      { id: 'aleph', name: 'Aleph Arena (YouTube)', delaySeconds: 45, logo: '▶️', type: 'streaming' },
      { id: 'cignal', name: 'Cignal', delaySeconds: 50, logo: '📡', type: 'cable' },
    ],
  },
  {
    id: 'me',
    name: 'Middle East',
    flag: '🇸🇦',
    services: [
      { id: 'bein-tv', name: 'beIN Sports (TV)', delaySeconds: 30, logo: '📡', type: 'cable' },
      { id: 'tod', name: 'TOD (beIN streaming)', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    services: [
      { id: 'bbc-tv', name: 'BBC One / Two', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'bbc-iplayer', name: 'BBC iPlayer', delaySeconds: 40, logo: '📱', type: 'streaming' },
      { id: 'itv-tv', name: 'ITV', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'itvx', name: 'ITVX', delaySeconds: 40, logo: '📱', type: 'streaming' },
      { id: 'stv', name: 'STV (Scotland)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'sky-sports', name: 'Sky Sports', delaySeconds: 30, logo: '📡', type: 'cable' },
    ],
  },
  {
    id: 'ie',
    name: 'Ireland',
    flag: '🇮🇪',
    services: [
      { id: 'rte-tv', name: 'RTÉ', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'rte-player', name: 'RTÉ Player', delaySeconds: 40, logo: '📱', type: 'streaming' },
      { id: 'virgin-media', name: 'Virgin Media', delaySeconds: 40, logo: '📡', type: 'streaming' },
    ],
  },
  {
    id: 'nl',
    name: 'Netherlands',
    flag: '🇳🇱',
    services: [
      { id: 'nos', name: 'NOS / NPO', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'npo-start', name: 'NPO Start', delaySeconds: 40, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'de',
    name: 'Germany',
    flag: '🇩🇪',
    services: [
      { id: 'ard-zdf', name: 'ARD / ZDF', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'magenta', name: 'MagentaTV', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'fr',
    name: 'France',
    flag: '🇫🇷',
    services: [
      { id: 'm6', name: 'M6 / TF1', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'bein-fr', name: 'beIN Sports', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'it',
    name: 'Italy',
    flag: '🇮🇹',
    services: [
      { id: 'rai', name: 'RAI', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'dazn-it', name: 'DAZN', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'es',
    name: 'Spain',
    flag: '🇪🇸',
    services: [
      { id: 'rtve', name: 'RTVE', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'dazn-es', name: 'DAZN', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'pt',
    name: 'Portugal',
    flag: '🇵🇹',
    services: [
      { id: 'rtp', name: 'RTP', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'sport-tv', name: 'sport tv', delaySeconds: 30, logo: '📡', type: 'cable' },
    ],
  },
  {
    id: 'nordics',
    name: 'Nordics',
    flag: '🇩🇰',
    services: [
      { id: 'dr-tv2', name: 'DR / TV2 (Denmark)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'nrk', name: 'NRK (Norway)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'svt', name: 'SVT (Sweden)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'yle', name: 'Yle (Finland)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'nordic-stream', name: 'Viaplay / TV2 Play', delaySeconds: 45, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸',
    services: [
      { id: 'fox-ota', name: 'Fox / FS1 (antenna)', delaySeconds: 20, logo: '📡', type: 'broadcast' },
      { id: 'fox-app', name: 'Fox Sports app', delaySeconds: 50, logo: '📱', type: 'streaming' },
      { id: 'peacock', name: 'Peacock / Telemundo', delaySeconds: 48, logo: '📱', type: 'streaming' },
      { id: 'youtube-tv', name: 'YouTube TV', delaySeconds: 39, logo: '▶️', type: 'streaming' },
      { id: 'hulu-live', name: 'Hulu + Live TV', delaySeconds: 53, logo: '📱', type: 'streaming' },
      { id: 'sling', name: 'Sling TV', delaySeconds: 59, logo: '📱', type: 'streaming' },
      { id: 'directv-stream', name: 'DirecTV Stream', delaySeconds: 66, logo: '📡', type: 'streaming' },
      { id: 'fubo', name: 'Fubo TV', delaySeconds: 87, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'ca',
    name: 'Canada',
    flag: '🇨🇦',
    services: [
      { id: 'ctv-tv', name: 'CTV (broadcast)', delaySeconds: 20, logo: '📺', type: 'broadcast' },
      { id: 'tsn', name: 'TSN / RDS', delaySeconds: 45, logo: '📡', type: 'cable' },
      { id: 'ctv-app', name: 'CTV app', delaySeconds: 45, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'mx',
    name: 'Mexico',
    flag: '🇲🇽',
    services: [
      { id: 'televisa', name: 'Televisa (Canal 5)', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'tv-azteca', name: 'TV Azteca', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'vix-mx', name: 'ViX', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'br',
    name: 'Brazil',
    flag: '🇧🇷',
    services: [
      { id: 'globo', name: 'Globo', delaySeconds: 20, logo: '📺', type: 'broadcast' },
      { id: 'globoplay', name: 'Globoplay', delaySeconds: 50, logo: '📱', type: 'streaming' },
      { id: 'cazetv', name: 'CazéTV (YouTube)', delaySeconds: 45, logo: '▶️', type: 'streaming' },
    ],
  },
  {
    id: 'ar',
    name: 'Argentina',
    flag: '🇦🇷',
    services: [
      { id: 'telefe', name: 'Telefe / TV Pública', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'tyc', name: 'TyC Sports', delaySeconds: 45, logo: '📡', type: 'cable' },
      { id: 'disney-ar', name: 'Disney+ Premium', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'latam',
    name: 'Latin America',
    flag: '🌎',
    services: [
      { id: 'vix', name: 'ViX', delaySeconds: 50, logo: '📱', type: 'streaming' },
      { id: 'disney-latam', name: 'Disney+ / ESPN', delaySeconds: 50, logo: '📱', type: 'streaming' },
      { id: 'tigo', name: 'Tigo Sports', delaySeconds: 50, logo: '📱', type: 'streaming' },
    ],
  },
  {
    id: 'za',
    name: 'South Africa',
    flag: '🇿🇦',
    services: [
      { id: 'sabc', name: 'SABC', delaySeconds: 10, logo: '📺', type: 'broadcast' },
      { id: 'sporty', name: 'SportyTV', delaySeconds: 45, logo: '📡', type: 'cable' },
    ],
  },
  {
    id: 'africa',
    name: 'Africa',
    flag: '🌍',
    services: [
      { id: 'supersport', name: 'SuperSport', delaySeconds: 30, logo: '📡', type: 'cable' },
      { id: 'startimes', name: 'StarTimes', delaySeconds: 45, logo: '📡', type: 'cable' },
    ],
  },
]

export const PAUSED_TV_SERVICE: StreamingService = {
  id: 'paused-tv',
  name: 'Paused TV',
  delaySeconds: 15,
  logo: '⏸️',
  type: 'paused',
}

export const OTHER_SERVICE: StreamingService = {
  id: 'other',
  name: 'Other / Not sure',
  delaySeconds: 45,
  logo: '❓',
  type: 'streaming',
}

const ALL_SERVICES: StreamingService[] = [
  PAUSED_TV_SERVICE,
  OTHER_SERVICE,
  ...REGIONS.flatMap((r) => r.services),
]

export function findServiceById(id: string): StreamingService | null {
  return ALL_SERVICES.find((s) => s.id === id) ?? null
}
