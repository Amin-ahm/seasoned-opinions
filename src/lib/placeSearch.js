// Free place search via Photon (photon.komoot.io) over OpenStreetMap data.
// No API key, no billing. Type-ahead friendly (Photon is built for it).
//
// Results are limited to Canada and biased toward the GTA. To include the US
// or elsewhere, add codes to COUNTRY_CODES; to bias a different area, change
// BIAS. Set COUNTRY_CODES to [] to allow anywhere.
const COUNTRY_CODES = ['ca']
const BIAS = { lat: 43.72, lon: -79.42 } // Greater Toronto Area

export async function searchPlaces(queryStr, signal) {
  const q = (queryStr || '').trim()
  if (q.length < 3) return []
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
    `&limit=8&lang=en&lat=${BIAS.lat}&lon=${BIAS.lon}`
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return []
    const data = await res.json()
    const feats = (data.features || []).filter((f) => {
      if (!COUNTRY_CODES.length) return true
      const cc = (f.properties?.countrycode || '').toLowerCase()
      return COUNTRY_CODES.includes(cc)
    })
    return feats.map(toPlace).filter((p) => p.name)
  } catch {
    return []
  }
}

function toPlace(f) {
  const p = f.properties || {}
  const [lon, lat] = f.geometry?.coordinates || []
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ')
  const name =
    p.name || streetLine || p.city || p.town || p.village || 'Unknown place'
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
    category: guessCategory(p),
  }
}

function guessCategory(p) {
  const v = p.osm_value
  if (v === 'cafe' || v === 'coffee') return 'coffee'
  if (v === 'bakery') return 'bakery'
  if (v === 'restaurant' || v === 'fast_food' || v === 'food_court')
    return 'restaurant'
  if (v === 'florist') return 'flowers'
  if (v === 'car_repair') return 'mechanic'
  if (v === 'farm' || v === 'greengrocer' || v === 'marketplace')
    return 'farmer'
  if (v === 'supermarket' || v === 'convenience') return 'grocery'
  return 'other'
}
