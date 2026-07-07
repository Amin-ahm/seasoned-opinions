// Two modes:
//  - readonly display of an average rating (supports halves visually)
//  - interactive 1–5 picker (used on the detail page)
import { useState } from 'react'

export function StarDisplay({ value = 0, count, size = '1.1rem' }) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span className="row" style={{ gap: 6 }}>
      <span className="stars" style={{ fontSize: size }} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rounded >= i
          const half = !filled && rounded >= i - 0.5
          return (
            <span key={i} className={filled || half ? '' : 'star-empty'}>
              {filled ? '★' : half ? '⯪' : '☆'}
            </span>
          )
        })}
      </span>
      <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
        {value ? value.toFixed(1) : '-'}
        {typeof count === 'number' ? ` (${count})` : ''}
      </span>
    </span>
  )
}

export function StarPicker({ value = 0, onRate, disabled }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div
      className="row"
      role="radiogroup"
      aria-label="Your rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`star-btn ${active >= i ? 'on' : ''}`}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          aria-checked={value === i}
          role="radio"
          disabled={disabled}
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onClick={() => onRate(i)}
        >
          {active >= i ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
