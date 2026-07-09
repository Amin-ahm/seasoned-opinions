import { Suspense, lazy, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSpots } from '../hooks/useSpots'
import { useAuth } from '../context/AuthContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { FilterBar } from '../components/FilterBar'
import { Modal } from '../components/Modal'
import { EmptyState, PriceScale, CategoryChip } from '../components/bits'
import { StarDisplay } from '../components/StarRating'
import { DEFAULT_FILTERS, filterSpots, decidePick } from '../lib/filters'
import { hasUserRated } from '../lib/interactions'
import { CATEGORY_MAP } from '../lib/constants'

const DecideWheel = lazy(() => import('../components/three/DecideWheel'))

const MODES = [
  { value: 'surprise', label: '🎲 Surprise Me', hint: 'Totally random from the survivors.' },
  { value: 'crowd', label: '👑 Crowd Favorite', hint: 'Weighted toward the well-loved.' },
  { value: 'new', label: '✨ Something New', hint: 'Only spots you haven’t rated yet.' },
]

const catEmoji = (c) => (CATEGORY_MAP[c] || CATEGORY_MAP.other)?.emoji || '📍'

export function DecideForMe() {
  const { spots } = useSpots()
  const { user } = useAuth()
  const reduced = useReducedMotion()
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [sortBy, setSortBy] = useState('rating')
  const [mode, setMode] = useState('surprise')

  const [open, setOpen] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const [segments, setSegments] = useState([])
  const [winnerIndex, setWinnerIndex] = useState(0)
  const [winner, setWinner] = useState(null)
  const [settled, setSettled] = useState(false)
  const [noResults, setNoResults] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set()
    spots.forEach((s) => (s.tags || []).forEach((t) => set.add(t)))
    return Array.from(set)
  }, [spots])

  const candidates = useMemo(
    () => filterSpots(spots, filters),
    [spots, filters]
  )

  async function spin() {
    setNoResults(false)

    // For "Something New" we need the set of spots this user has already rated.
    let ratedIds = null
    if (mode === 'new' && user) {
      const flags = await Promise.all(
        candidates.map((s) => hasUserRated(s.id, user.uid))
      )
      ratedIds = new Set(candidates.filter((_, i) => flags[i]).map((s) => s.id))
    }

    const pick = decidePick(candidates, mode, ratedIds, Math.random())
    if (!pick) {
      setNoResults(true)
      setWinner(null)
      setOpen(true)
      return
    }

    // Build a display wheel (up to 8 segments) that always includes the winner.
    const others = candidates.filter((s) => s.id !== pick.id)
    shuffle(others)
    const display = [pick, ...others.slice(0, 7)]
    shuffle(display)
    const idx = display.findIndex((s) => s.id === pick.id)

    setSegments(
      display.map((s) => ({ name: s.name, emoji: catEmoji(s.category) }))
    )
    setWinnerIndex(idx)
    setWinner(pick)
    setSettled(reduced) // if reduced, show result immediately
    setSpinKey((k) => k + 1)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setSettled(false)
    setWinner(null)
  }

  return (
    <div className="container page">
      <h1 className="section-title">🎡 Decide for Me</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Can't pick? Set any filters, choose a mode, and let the wheel settle it.
      </p>

      <div className="decide-modes">
        {MODES.map((m) => (
          <button
            key={m.value}
            className={`decide-mode card ${mode === m.value ? 'selected' : ''}`}
            onClick={() => setMode(m.value)}
          >
            <span className="decide-mode-label">{m.label}</span>
            <span className="muted decide-mode-hint">{m.hint}</span>
          </button>
        ))}
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allTags={allTags}
      />

      <div className="decide-cta">
        <span className="muted">
          {candidates.length} spot{candidates.length === 1 ? '' : 's'} in the running
        </span>
        <button
          className="btn btn-grape btn-lg"
          onClick={spin}
          disabled={candidates.length === 0}
        >
          🎡 Spin the wheel!
        </button>
      </div>

      <Modal open={open} onClose={close} title={noResults ? 'No matches' : 'And the winner is…'} wide>
        {noResults ? (
          <EmptyState emoji="😅" title="Nothing survived those filters">
            Loosen the filters or switch modes and try again.
          </EmptyState>
        ) : (
          <div className="decide-reveal">
            {!reduced && !settled && (
              <div className="wheel-stage" aria-hidden="true">
                <Suspense fallback={<div className="wheel-loading">Spinning up the wheel…</div>}>
                  <DecideWheel
                    segments={segments}
                    winnerIndex={winnerIndex}
                    spinKey={spinKey}
                    reduced={reduced}
                    onSettled={() => setSettled(true)}
                  />
                </Suspense>
              </div>
            )}

            {settled && winner && (
              <div className="winner-card">
                <div className="winner-emoji" aria-hidden="true">
                  {catEmoji(winner.category)}
                </div>
                <h2>{winner.name}</h2>
                <div className="row row-wrap center-row" style={{ gap: 10, justifyContent: 'center' }}>
                  <CategoryChip category={winner.category} />
                  <PriceScale scale={winner.priceScale} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <StarDisplay value={winner.avgRating} count={winner.ratingCount} />
                </div>
                <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 18 }}>
                  <Link to={`/spot/${winner.id}`} className="btn btn-primary" onClick={close}>
                    Let's go →
                  </Link>
                  <button className="btn btn-ghost" onClick={spin}>
                    Spin again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
