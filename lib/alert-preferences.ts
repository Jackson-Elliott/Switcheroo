export type AlertPreferenceKey =
  | 'goals'
  | 'penalties'
  | 'bigChances'
  | 'varPenalty'
  | 'varGoalCancelled'
  | 'varReview'
  | 'redCards'

export type AlertPreferences = Record<AlertPreferenceKey, boolean>

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  goals: true,
  penalties: true,
  bigChances: true,
  varPenalty: true,
  varGoalCancelled: true,
  varReview: true,
  redCards: true,
}

function isPenaltyGoalDetail(detail: string): boolean {
  return detail === 'Penalty' || detail === 'Missed Penalty'
}

function getAlertPreferenceKey(type: string, detail: string): AlertPreferenceKey | null {
  if (type === 'Goal') {
    return isPenaltyGoalDetail(detail) ? 'penalties' : 'goals'
  }

  if (type === 'Chance' && (detail === 'Big Chance' || detail === 'Shot on Goal')) {
    return 'bigChances'
  }

  if (type === 'Var') {
    if (detail === 'Penalty confirmed') return 'varPenalty'
    if (detail === 'Goal cancelled') return 'varGoalCancelled'
    return 'varReview'
  }

  if (type === 'Card') {
    if (detail === 'Red Card' || detail === 'Yellow-Red Card') return 'redCards'
  }

  return null
}

export function isAlertEnabled(
  type: string,
  detail: string,
  preferences: AlertPreferences
): boolean {
  const key = getAlertPreferenceKey(type, detail)
  if (!key) return false
  return preferences[key]
}
