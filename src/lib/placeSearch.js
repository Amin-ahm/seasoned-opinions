// Free place search over OpenStreetMap data. No API key, no billing.
// Primary source is Photon (built for type-ahead); if it comes up short we
// fall back to Nominatim, which sometimes indexes businesses Photon misses.
//
// Results prefer Canada and are biased toward the GTA. To include the US or
// elsewhere, add codes to COUNTRY_CODES (or set it to [] for anywhere) and/or
// change BIAS.
const COUNTRY_CODES = ['ca']
const BIAS = { lat: 43.72, lon: -79.42 } // Greater Toronto Area

export async function searchPlaces(queryStr, signal) {
  const q = (queryStr || '').trim()
  if (q.length < 2) return []

  let results = await fromPhoton(q, signal)
  if (results.length < 3) {
    const extra = await fromNominatim(q, signal)
    results = dedupe([...results, ...extra])
  }
  return results.slice(0, 12)
}

async function fromPhoton(q, signal) {
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
    `&limit=15&lang=en&lat=${BIAS.lat}&lon=${BIAS.lon}`
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return []
    const data = await res.json()
    const all = (data.features || []).map(fromPhotonFeature).filter((p) => p.name)
    // Strict country limit: never surface out-of-country results.
    if (!COUNTRY_CODES.length) return all
    return all.filter((p) => COUNTRY_CODES.includes((p._cc || '').toLowerCase()))
  } catch {
    return []
  }
}

async function fromNominatim(q, signal) {
  const cc = COUNTRY_CODES.length ? `&countrycodes=${COUNTRY_CODES.join(',')}` : ''
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1` +
    `&limit=10${cc}&q=${encodeURIComponent(q)}`
  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const data = await res.json()
    return (Array.isArray(data) ? data : []).map(fromNominatimResult).filter((p) => p.name)
  } catch {
    return []
  }
}

function fromPhotonFeature(f) {
  const p = f.properties || {}
  const [lon, lat] = f.geometry?.coordinates || []
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ')
  const name = p.name || streetLine || p.city || p.town || p.village || 'Unknown place'
  const address = [
    streetLine,
    p.city || p.town || p.village || p.district,
    p.state,
    p.postcode,
    p.country,
  ]
    .filter(Boolean)
    .join(', ')
  return {
    name,
    address,
    lat: typeof lat === 'number' ? lat : null,
    lng: typeof lon === 'number' ? lon : null,
    category: guessCategory(p.osm_value),
    _cc: p.countrycode,
  }
}

function fromNominatimResult(r) {
  const a = r.address || {}
  const name =
    r.name ||
    a.amenity ||
    a.shop ||
    [a.house_number, a.road].filter(Boolean).join(' ') ||
    (r.display_name || '').split(',')[0]
  return {
    name,
    address: r.display_name || '',
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    category: guessCategory(r.type),
    _cc: a.country_code,
  }
}

function guessCategory(v) {
  if (v === 'cafe' || v === 'coffee') return 'coffee'
  if (v === 'bakery') return 'bakery'
  if (v === 'restaurant' || v === 'fast_food' || v === 'food_court') return 'restaurant'
  if (v === 'bar' || v === 'pub') return 'bar'
  if (v === 'florist') return 'flowers'
  if (v === 'car_repair') return 'mechanic'
  if (v === 'farm' || v === 'greengrocer' || v === 'marketplace') return 'farmer'
  if (v === 'supermarket' || v === 'convenience') return 'grocery'
  if (v === 'hairdresser' || v === 'beauty') return 'beauty'
  if (v === 'fitness_centre' || v === 'gym') return 'fitness'
  if (v === 'cinema' || v === 'theatre') return 'entertainment'
  return 'other'
}

function dedupe(list) {
  const seen = new Set()
  const out = []
  for (const p of list) {
    const key = `${p.name}|${Math.round((p.lat || 0) * 1000)}|${Math.round((p.lng || 0) * 1000)}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(p)
    }
  }
  return out
}
