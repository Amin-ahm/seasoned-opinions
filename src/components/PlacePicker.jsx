// Type-ahead place search that fills in a spot for you. Debounced, keyboard
// accessible, and cancels stale requests. Calls onSelect({name,address,lat,lng,category}).
import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../lib/placeSearch'

export function PlacePicker({ onSelect }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      const found = await searchPlaces(q, ctrl.signal)
      setResults(found)
      setOpen(true)
      setActive(-1)
      setLoading(false)
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function choose(place) {
    onSelect?.(place)
    setQ('')
    setResults([])
    setOpen(false)
  }

  function onKeyDown(e) {
    if (!open || !results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="place-picker" ref={boxRef}>
      <div className="place-picker-input">
        <span aria-hidden="true">🔎</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search for a place in Canada…"
          aria-label="Search for a place"
          autoComplete="off"
        />
        {loading && <span className="place-picker-spin" aria-hidden="true">⏳</span>}
      </div>

      {open && (
        <ul className="place-results" role="listbox">
          {results.length === 0 && !loading ? (
            <li className="place-empty">No matches. You can type the details in below.</li>
          ) : (
            results.map((p, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={`place-result ${i === active ? 'active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(p)}
                >
                  <span className="place-result-name">{p.name}</span>
                  <span className="place-result-addr">{p.address}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      <p className="hint">
        Powered by OpenStreetMap. Limited to Canada. Pick a result to auto-fill
        the name, address, and map location.
      </p>
    </div>
  )
}
