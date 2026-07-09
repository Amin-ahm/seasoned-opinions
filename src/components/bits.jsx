// Small shared presentational bits.
import { PRICE_LABELS, CATEGORY_MAP, AVAILABILITY_MAP } from '../lib/constants'

export function PriceScale({ scale = 1 }) {
  const n = Math.max(1, Math.min(4, scale))
  return (
    <span className="pill-price" title={PRICE_LABELS[n - 1]}>
      {'$'.repeat(n)}
      <span className="off">{'$'.repeat(4 - n)}</span>
    </span>
  )
}

export function CategoryChip({ category }) {
  const c = CATEGORY_MAP[category] || CATEGORY_MAP.other
  return (
    <span className="chip">
      <span aria-hidden="true">{c.emoji}</span> {c.label}
    </span>
  )
}

export function TagChip({ tag }) {
  return <span className="chip chip-tag">#{tag}</span>
}

export function AvailabilityChip({ value }) {
  const a = AVAILABILITY_MAP[value]
  if (!a) return null
  return (
    <span className="chip chip-avail">
      <span aria-hidden="true">{a.emoji}</span> {a.label}
    </span>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="center" style={{ padding: 40 }} role="status">
      <div className="spinner-dot" aria-hidden="true">
        💬
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        {label}
      </p>
    </div>
  )
}

export function EmptyState({ emoji = '📭', title, children }) {
  return (
    <div className="empty-state">
      <div className="big" aria-hidden="true">
        {emoji}
      </div>
      <h3>{title}</h3>
      {children && <p className="muted">{children}</p>}
    </div>
  )
}

export function SpotCardSkeleton() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 22, width: '70%' }} />
      <div
        className="skeleton"
        style={{ height: 14, width: '40%', marginTop: 12 }}
      />
      <div
        className="skeleton"
        style={{ height: 60, width: '100%', marginTop: 16 }}
      />
      <div
        className="skeleton"
        style={{ height: 28, width: '100%', marginTop: 16 }}
      />
    </div>
  )
}
