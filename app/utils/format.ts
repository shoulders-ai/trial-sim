/** Format a number with commas */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** Format a number as percentage */
export function formatPercent(n: number, decimals = 0): string {
  return (n * 100).toFixed(decimals) + '%'
}

/** Format months to human-readable duration */
export function formatDuration(months: number): string {
  if (months < 1) return `${Math.round(months * 30)} days`
  if (months < 12) return `${months.toFixed(1)} months`
  const years = Math.floor(months / 12)
  const remaining = months % 12
  if (remaining < 0.5) return `${years} year${years > 1 ? 's' : ''}`
  return `${years}y ${Math.round(remaining)}m`
}

/** Format with +/- sign */
export function formatSigned(n: number): string {
  const prefix = n > 0 ? '+' : ''
  return prefix + Math.round(n).toLocaleString('en-US')
}
