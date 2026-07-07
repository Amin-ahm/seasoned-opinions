// Pure client-side filtering, sorting, and the "Decide for Me" logic.
// All of this runs over the already-loaded spot list.

export const DEFAULT_FILTERS = {
  search: '',
  category: 'all',
  maxPrice: 4, // include spots with priceScale <= maxPrice
  tags: [], // spot must include ALL selected tags
  availability: [], // spot must include ALL selected availability options
}

export function filterSpots(spots, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters }
  const search = f.search.trim().toLowerCase()

  return spots.filter((s) => {
    if (search && !s.name?.toLowerCase().includes(search)) return false
    if (f.category !== 'all' && s.category !== f.category) return false
    if ((s.priceScale || 1) > f.maxPrice) return false
    if (f.tags.length) {
      const tags = s.tags || []
      if (!f.tags.every((t) => tags.includes(t))) return false
    }
    if (f.availability.length) {
      const avail = s.availability || []
      if (!f.availability.every((a) => avail.includes(a))) return false
    }
    return true
  })
}

export function sortSpots(spots, sortBy) {
  const arr = [...spots]
  switch (sortBy) {
    case 'rating':
      return arr.sort(
        (a, b) =>
          (b.avgRating || 0) - (a.avgRating || 0) ||
          (b.ratingCount || 0) - (a.ratingCount || 0)
      )
    case 'votes':
      return arr.sort((a, b) => (b.voteScore || 0) - (a.voteScore || 0))
    case 'priceLow':
      return arr.sort((a, b) => (a.priceScale || 0) - (b.priceScale || 0))
    case 'priceHigh':
      return arr.sort((a, b) => (b.priceScale || 0) - (a.priceScale || 0))
    case 'newest':
    default:
      return arr.sort(
        (a, b) => (millis(b.createdAt) || 0) - (millis(a.createdAt) || 0)
      )
  }
}

function millis(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds) return ts.seconds * 1000
  return 0
}

export function hasActiveFilters(filters) {
  const f = { ...DEFAULT_FILTERS, ...filters }
  return (
    !!f.search ||
    f.category !== 'all' ||
    f.maxPrice < 4 ||
    f.tags.length > 0 ||
    f.availability.length > 0
  )
}

/* ------------------------- Decide for Me ------------------------- */

/**
 * Pick a spot from the candidate list.
 * mode: "surprise" | "crowd" | "new"
 * ratedIds: Set of spotIds the current user has already rated (for "new").
 * rand: 0..1 random value (passed in so callers control randomness).
 */
export function decidePick(candidates, mode, ratedIds, rand = Math.random()) {
  let pool = candidates
  if (mode === 'new' && ratedIds) {
    pool = candidates.filter((s) => !ratedIds.has(s.id))
  }
  if (pool.length === 0) return null

  if (mode === 'crowd') {
    // Weight by a blend of vote score and average rating so that popular,
    // well-liked spots surface more often. Weights are kept positive.
    const weights = pool.map((s) => {
      const voteW = Math.max(0, (s.voteScore || 0)) + 1
      const rateW = (s.avgRating || 0) * (s.ratingCount ? 1.5 : 0.5) + 1
      return voteW + rateW
    })
    const total = weights.reduce((a, b) => a + b, 0)
    let target = rand * total
    for (let i = 0; i < pool.length; i++) {
      target -= weights[i]
      if (target <= 0) return pool[i]
    }
    return pool[pool.length - 1]
  }

  // "surprise" and "new" - uniform random.
  const idx = Math.floor(rand * pool.length)
  return pool[Math.min(idx, pool.length - 1)]
}
