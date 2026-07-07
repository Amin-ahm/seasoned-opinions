// Shared form for adding and editing a spot. googleMaps link is auto-generated
// from the address (never typed); lat/lng are geocoded on save by the caller.
import { useState } from 'react'
import {
  CATEGORIES,
  AVAILABILITY,
  SUGGESTED_TAGS,
  PRICE_LABELS,
} from '../lib/constants'

const EMPTY = {
  name: '',
  category: 'restaurant',
  address: '',
  priceScale: 2,
  tags: [],
  availability: [],
  orderLinks: { doordash: '', ubereats: '' },
  whatsGood: '',
  whatToSkip: '',
  photoUrl: '',
}

// Convert a stored spot (arrays) into form state (newline-joined text areas).
export function spotToForm(spot) {
  return {
    name: spot.name || '',
    category: spot.category || 'restaurant',
    address: spot.address || '',
    priceScale: spot.priceScale || 2,
    tags: spot.tags || [],
    availability: spot.availability || [],
    orderLinks: {
      doordash: spot.orderLinks?.doordash || '',
      ubereats: spot.orderLinks?.ubereats || '',
    },
    whatsGood: (spot.whatsGood || []).join('\n'),
    whatToSkip: (spot.whatToSkip || []).join('\n'),
    photoUrl: spot.photoUrl || '',
  }
}

export function SpotForm({ initial, submitLabel = 'Add spot', onSubmit, busy }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [customTag, setCustomTag] = useState('')
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggle(key, value) {
    setForm((f) => {
      const arr = f[key]
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      }
    })
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
    }
    setCustomTag('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Give the spot a name.'
    if (!form.address.trim()) errs.address = 'An address helps the map + links.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    onSubmit({
      ...form,
      whatsGood: splitLines(form.whatsGood),
      whatToSkip: splitLines(form.whatToSkip),
    })
  }

  const tagUniverse = Array.from(new Set([...SUGGESTED_TAGS, ...form.tags]))

  return (
    <form onSubmit={handleSubmit} className="spot-form card">
      <div className="field">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Nonna's Trattoria"
        />
        {errors.name && <p className="hint error">{errors.name}</p>}
      </div>

      <div className="field">
        <label>Category</label>
        <div className="chip-row">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.value}
              className={`chip ${form.category === c.value ? 'is-active' : ''}`}
              onClick={() => set('category', c.value)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="address">Address *</label>
        <input
          id="address"
          type="text"
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="123 Main St, City"
        />
        <p className="hint">
          We'll geocode this for the map and auto-generate the Google Maps link.
        </p>
        {errors.address && <p className="hint error">{errors.address}</p>}
      </div>

      <div className="field">
        <label>
          Price:{' '}
          <span className="pill-price">{PRICE_LABELS[form.priceScale - 1]}</span>
        </label>
        <div className="chip-row">
          {[1, 2, 3, 4].map((n) => (
            <button
              type="button"
              key={n}
              className={`chip ${form.priceScale === n ? 'is-active' : ''}`}
              onClick={() => set('priceScale', n)}
            >
              {'$'.repeat(n)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Availability</label>
        <div className="chip-row">
          {AVAILABILITY.map((a) => (
            <button
              type="button"
              key={a.value}
              className={`chip ${
                form.availability.includes(a.value) ? 'is-active' : ''
              }`}
              onClick={() => toggle('availability', a.value)}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Tags</label>
        <div className="chip-row">
          {tagUniverse.map((t) => (
            <button
              type="button"
              key={t}
              className={`chip ${form.tags.includes(t) ? 'is-active' : ''}`}
              onClick={() => toggle('tags', t)}
            >
              #{t}
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomTag()
              }
            }}
            placeholder="Add your own tag…"
          />
          <button type="button" className="btn btn-ghost" onClick={addCustomTag}>
            Add
          </button>
        </div>
      </div>

      <div className="two-col">
        <div className="field">
          <label htmlFor="good">What's good</label>
          <textarea
            id="good"
            value={form.whatsGood}
            onChange={(e) => set('whatsGood', e.target.value)}
            placeholder="One item per line&#10;e.g. Carbonara&#10;Tiramisu"
          />
          <p className="hint">One menu winner per line.</p>
        </div>
        <div className="field">
          <label htmlFor="skip">What to skip</label>
          <textarea
            id="skip"
            value={form.whatToSkip}
            onChange={(e) => set('whatToSkip', e.target.value)}
            placeholder="One item per line&#10;e.g. Sad side salad"
          />
          <p className="hint">One menu dud per line.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="field">
          <label htmlFor="dd">DoorDash link</label>
          <input
            id="dd"
            type="url"
            value={form.orderLinks.doordash}
            onChange={(e) =>
              set('orderLinks', { ...form.orderLinks, doordash: e.target.value })
            }
            placeholder="https://doordash.com/store/…"
          />
        </div>
        <div className="field">
          <label htmlFor="ue">Uber Eats link</label>
          <input
            id="ue"
            type="url"
            value={form.orderLinks.ubereats}
            onChange={(e) =>
              set('orderLinks', { ...form.orderLinks, ubereats: e.target.value })
            }
            placeholder="https://ubereats.com/store/…"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="photo">Photo URL</label>
        <input
          id="photo"
          type="url"
          value={form.photoUrl}
          onChange={(e) => set('photoUrl', e.target.value)}
          placeholder="https://…/your-photo.jpg"
        />
        <p className="hint">
          Paste a link to a photo <strong>you took or have the rights to use</strong>.
          Don't paste images from Google Maps, DoorDash, or Uber Eats.
        </p>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

function splitLines(text) {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}
