import { REGIONS } from './services'

const TIMEZONE_REGION_MAP: Record<string, string> = {
  'Australia/Sydney': 'au',
  'Australia/Melbourne': 'au',
  'Australia/Brisbane': 'au',
  'Australia/Perth': 'au',
  'Australia/Adelaide': 'au',
  'Pacific/Auckland': 'nz',
  'Asia/Kolkata': 'in',
  'Asia/Tokyo': 'jp',
  'Asia/Seoul': 'kr',
  'Asia/Shanghai': 'cn',
  'Asia/Singapore': 'sg',
  'Asia/Manila': 'ph',
  'Asia/Riyadh': 'me',
  'Asia/Dubai': 'me',
  'Europe/London': 'uk',
  'Europe/Dublin': 'ie',
  'Europe/Amsterdam': 'nl',
  'Europe/Berlin': 'de',
  'Europe/Paris': 'fr',
  'Europe/Rome': 'it',
  'Europe/Madrid': 'es',
  'Europe/Lisbon': 'pt',
  'Europe/Copenhagen': 'nordics',
  'Europe/Oslo': 'nordics',
  'Europe/Stockholm': 'nordics',
  'Europe/Helsinki': 'nordics',
  'America/New_York': 'us',
  'America/Chicago': 'us',
  'America/Denver': 'us',
  'America/Los_Angeles': 'us',
  'America/Toronto': 'ca',
  'America/Vancouver': 'ca',
  'America/Mexico_City': 'mx',
  'America/Sao_Paulo': 'br',
  'America/Buenos_Aires': 'ar',
  'Africa/Johannesburg': 'za',
}

const LOCALE_REGION_MAP: Record<string, string> = {
  AU: 'au',
  NZ: 'nz',
  IN: 'in',
  JP: 'jp',
  KR: 'kr',
  CN: 'cn',
  SG: 'sg',
  PH: 'ph',
  SA: 'me',
  AE: 'me',
  GB: 'uk',
  IE: 'ie',
  NL: 'nl',
  DE: 'de',
  FR: 'fr',
  IT: 'it',
  ES: 'es',
  PT: 'pt',
  DK: 'nordics',
  NO: 'nordics',
  SE: 'nordics',
  FI: 'nordics',
  US: 'us',
  CA: 'ca',
  MX: 'mx',
  BR: 'br',
  AR: 'ar',
  ZA: 'za',
}

export function detectDefaultRegionId(timeZone?: string): string {
  const tz = timeZone ?? (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC')

  if (TIMEZONE_REGION_MAP[tz]) return TIMEZONE_REGION_MAP[tz]

  if (tz.startsWith('America/')) {
    const southern = ['Argentina', 'Sao_Paulo', 'Buenos_Aires', 'Santiago', 'Bogota', 'Lima']
    if (southern.some((part) => tz.includes(part))) return 'latam'
    if (tz.includes('Mexico')) return 'mx'
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) return 'ca'
    return 'us'
  }

  if (tz.startsWith('Europe/')) return 'uk'
  if (tz.startsWith('Africa/')) return 'africa'
  if (tz.startsWith('Asia/')) return 'sg'

  if (typeof navigator !== 'undefined') {
    const locale = navigator.language.split('-')[1]?.toUpperCase()
    if (locale && LOCALE_REGION_MAP[locale]) return LOCALE_REGION_MAP[locale]
  }

  const valid = REGIONS.some((r) => r.id === 'au')
  return valid ? 'au' : REGIONS[0].id
}
