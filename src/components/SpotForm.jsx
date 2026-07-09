// Shared form for adding and editing a place. The place picker auto-fills the
// name, address, and map location. googleMaps link is auto-generated from the
// address; lat/lng come from the picker (or geocoding) on save.
import { useState } from 'react'
import {
  CATEGORIES,
  AVAILABILITY,
  SUGGESTED_TAGS,
  PRICE_LABELS,
  isFoodCategory,
} from '../lib/constants'
import { PlacePicker } from './PlacePicker'

const EMPTY = {
  name: '',
  category: 'restaurant',
  address: '',
  lat: null,
  lng: null,
  priceScale: 2,
  tags: [],
  availability: [],
  orderLinks: { website: '', doordash: '', ubereats: '' },
  whatsGood: '',
  whatToSkip: '',
  photoUrl: '',
}

export function spotToForm(spot) {
  return {
    name: spot.name || '',
    category: spot.category || 'restaurant',
    address: spot.address || '',
    lat: Number.isFinite(spot.lat) ? spot.lat : null,
    lng: Number.isFinite(spot.lng) ? spot.lng : null,
    priceScale: spot.priceScale || 2,
    tags: spot.tags || [],
    availability: spot.availability || [],
    orderLinks: {
      website: spot.orderLinks?.website || '',
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

  function onPick(place) {
    setForm((f) => ({
      ...f,
      name: f.name.trim() ? f.name : place.name,
      address: place.address || f.address,
      lat: place.lat,
      lng: place.lng,
      category:
        place.category && place.category !== 'other' ? place.category : f.category,
    }))
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setCustomTag('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Give the place a name.'
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
  const food = isFoodCategory(form.category)
  const availOptions = food
    ? AVAILABILITY
    : AVAILABILITY.filter((a) => !['doordash', 'ubereats'].includes(a.value))

  return (
    <form onSubmit={handleSubmit} className="spot-form card">
      <div className="field pick-field">
        <label>🔎 Search for the place (easiest)</label>
        <PlacePicker onSelect={onPick} />
      </div>

      <div className="or-divider"><span>or enter details manually</span></div>

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
          onChange={(e) =>
            setForm((f) => ({ ...f, address: e.target.value, lat: null, lng: null }))
          }
          placeholder="123 Main St, City"
        />
        <p className="hint">
          {Number.isFinite(form.lat)
            ? '📍 Location set from your search.'
            : "We'll look this up for the map and Google Maps link."}
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

      {food && (
        <div className="field">
          <label>Ways to get it</label>
          <div className="chip-row">
            {availOptions.map((a) => (
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
      )}

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
          <label htmlFor="good">{food ? "What's good" : 'Highlights'}</label>
          <textarea
            id="good"
            value={form.whatsGood}
            onChange={(e) => set('whatsGood', e.target.value)}
            placeholder={
              food
                ? 'One item per line&#10;e.g. Carbonara&#10;Tiramisu'
                : 'One per line&#10;e.g. Fast, fair prices'
            }
          />
          <p className="hint">One per line.</p>
        </div>
        <div className="field">
          <label htmlFor="skip">{food ? 'What to skip' : 'Heads-up'}</label>
          <textarea
            id="skip"
            value={form.whatToSkip}
            onChange={(e) => set('whatToSkip', e.target.value)}
            placeholder={
              food
                ? 'One item per line&#10;e.g. Sad side salad'
                : 'One per line&#10;e.g. Cash only'
            }
          />
          <p className="hint">One per line.</p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="website">Website / booking link</label>
        <input
          id="website"
          type="url"
          value={form.orderLinks.website}
          onChange={(e) =>
            set('orderLinks', { ...form.orderLinks, website: e.target.value })
          }
          placeholder="https://… (optional)"
        />
      </div>

      {food && (
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
      )}

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
