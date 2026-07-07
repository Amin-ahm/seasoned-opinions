// Google Maps deep links built from plain URLs - no Maps JavaScript API,
// no API key, no billing. We only ever link out.

export function mapsSearchUrl(address) {
  if (!address) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`
}

export function mapsDirectionsUrl(address) {
  if (!address) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}`
}

// Ensure a user-pasted order link has a protocol so it opens correctly.
export function normalizeUrl(url) {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
