// Search + filters. On desktop it's an inline panel; on small screens it
// collapses into a bottom-sheet drawer toggled by a "Filters" button.
import { useState } from 'react'
import {
  CATEGORIES,
  SUGGESTED_TAGS,
  SORT_OPTIONS,
  PRICE_LABELS,
} from '../lib/constants'
import { DEFAULT_FILTERS, hasActiveFilters } from '../lib/filters'

export function FilterBar({ filters, setFilters, sortBy, setSortBy, allTags }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const active = hasActiveFilters(filters)

  const tagUniverse = Array.from(
    new Set([...(allTags || []), ...SUGGESTED_TAGS])
  ).slice(0, 20)

  function toggleArray(key, value) {
    setFilters((f) => {
      const arr = f[key] || []
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      }
    })
  }

  function reset() {
    setFilters({ ...DEFAULT_FILTERS })
  }

  const panel = (
    <div className="filter-panel">
      <div className="field">
        <label>Category</label>
        <div className="chip-row">
          <button
            className={`chip ${filters.category === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, category: 'all' }))}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`chip ${
                filters.category === c.value ? 'is-active' : ''
              }`}
              onClick={() => setFilters((f) => ({ ...f, category: c.value }))}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="maxprice">
          Max price: <span className="pill-price">{PRICE_LABELS[filters.maxPrice - 1]}</span>
        </label>
        <input
          id="maxprice"
          type="range"
          min="1"
          max="4"
          step="1"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))
          }
        />
      </div>

      <div className="field">
        <label>Tags</label>
        <div className="chip-row">
          {tagUniverse.map((t) => (
            <button
              key={t}
              className={`chip ${
                filters.tags.includes(t) ? 'is-active' : ''
              }`}
              onClick={() => toggleArray('tags', t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <button className="btn btn-ghost btn-block" onClick={reset}>
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="filterbar">
      <div className="filterbar-top">
        <input
          type="search"
          className="search-input"
          placeholder="🔍 Search by name…"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
        />
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort spots"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          className={`btn btn-ghost filter-toggle ${active ? 'has-active' : ''}`}
          onClick={() => setDrawerOpen(true)}
        >
          ⚙️ Filters{active ? ' •' : ''}
        </button>
      </div>

      {/* Desktop inline panel */}
      <div className="filter-desktop">{panel}</div>

      {/* Mobile bottom-sheet drawer */}
      {drawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false)
          }}
        >
          <div className="drawer" role="dialog" aria-label="Filters">
            <div className="row spread drawer-head">
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            {panel}
            <button
              className="btn btn-primary btn-block"
              onClick={() => setDrawerOpen(false)}
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
