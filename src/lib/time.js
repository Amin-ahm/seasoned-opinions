// Format a Firestore timestamp (or pending serverTimestamp) into a short
// human-friendly relative/absolute string.
export function formatWhen(ts) {
  if (!ts) return 'just now'
  let date
  if (typeof ts.toDate === 'function') date = ts.toDate()
  else if (ts.seconds) date = new Date(ts.seconds * 1000)
  else return 'just now'

  const diff = Date.now() - date.getTime()
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour

  if (diff < min) return 'just now'
  if (diff < hour) return `${Math.floor(diff / min)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}
