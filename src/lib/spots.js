// Data layer for spots: create, read, update, delete + geocoding.
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { mapsSearchUrl, normalizeUrl } from './mapsLinks'

const spotsCol = collection(db, 'spots')

/**
 * Free geocoding via OpenStreetMap Nominatim. One request per submit.
 * Returns { lat, lng } or null on any failure - the spot still saves.
 */
export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      address
    )}`
    const res = await fetch(url, {
      headers: {
        // Nominatim asks for an identifying Referer/User-Agent. Browsers
        // forbid setting User-Agent, but Referer is sent automatically.
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0]
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lon)
      if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
        return { lat: latNum, lng: lngNum }
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Create a spot. Geocodes the address and auto-generates the Google Maps link.
 * `data` should already be validated/cleaned by the form.
 */
export async function createSpot(data, user) {
  // Prefer coordinates chosen via the place picker; otherwise geocode.
  const geo =
    Number.isFinite(data.lat) && Number.isFinite(data.lng)
      ? { lat: data.lat, lng: data.lng }
      : await geocodeAddress(data.address)

  const orderLinks = {}
  if (data.orderLinks?.doordash)
    orderLinks.doordash = normalizeUrl(data.orderLinks.doordash)
  if (data.orderLinks?.ubereats)
    orderLinks.ubereats = normalizeUrl(data.orderLinks.ubereats)
  // googleMaps is always auto-generated from the address, never typed.
  const gmaps = mapsSearchUrl(data.address)
  if (gmaps) orderLinks.googleMaps = gmaps

  const payload = {
    name: data.name.trim(),
    category: data.category,
    address: data.address.trim(),
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    priceScale: Number(data.priceScale) || 1,
    tags: dedupeStrings(data.tags),
    availability: data.availability || [],
    orderLinks,
    whatsGood: cleanList(data.whatsGood),
    whatToSkip: cleanList(data.whatToSkip),
    photoUrl: normalizeUrl(data.photoUrl) || null,
    createdBy: user.uid,
    createdByName: user.displayName || 'Anonymous',
    createdAt: serverTimestamp(),
    avgRating: 0,
    ratingCount: 0,
    voteScore: 0,
  }

  const ref = await addDoc(spotsCol, payload)
  return ref.id
}

export async function updateSpot(spotId, data) {
  const orderLinks = {}
  if (data.orderLinks?.doordash)
    orderLinks.doordash = normalizeUrl(data.orderLinks.doordash)
  if (data.orderLinks?.ubereats)
    orderLinks.ubereats = normalizeUrl(data.orderLinks.ubereats)
  const gmaps = mapsSearchUrl(data.address)
  if (gmaps) orderLinks.googleMaps = gmaps

  // Prefer picker coordinates; otherwise re-geocode in case the address changed.
  const geo =
    Number.isFinite(data.lat) && Number.isFinite(data.lng)
      ? { lat: data.lat, lng: data.lng }
      : await geocodeAddress(data.address)

  await updateDoc(doc(db, 'spots', spotId), {
    name: data.name.trim(),
    category: data.category,
    address: data.address.trim(),
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    priceScale: Number(data.priceScale) || 1,
    tags: dedupeStrings(data.tags),
    availability: data.availability || [],
    orderLinks,
    whatsGood: cleanList(data.whatsGood),
    whatToSkip: cleanList(data.whatToSkip),
    photoUrl: normalizeUrl(data.photoUrl) || null,
  })
}

export async function deleteSpot(spotId) {
  await deleteDoc(doc(db, 'spots', spotId))
}

export async function getSpot(spotId) {
  const snap = await getDoc(doc(db, 'spots', spotId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/** Live subscription to all spots, newest first. */
export function subscribeSpots(onData, onError) {
  const q = query(spotsCol, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const spots = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      onData(spots)
    },
    onError
  )
}

/** Live subscription to a single spot doc (keeps counters fresh on detail). */
export function subscribeSpot(spotId, onData, onError) {
  return onSnapshot(
    doc(db, 'spots', spotId),
    (snap) => {
      onData(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    },
    onError
  )
}

export async function fetchSpotsOnce() {
  const q = query(spotsCol, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

function dedupeStrings(arr) {
  if (!Array.isArray(arr)) return []
  const seen = new Set()
  const out = []
  for (const raw of arr) {
    const v = String(raw).trim().toLowerCase()
    if (v && !seen.has(v)) {
      seen.add(v)
      out.push(v)
    }
  }
  return out
}

function cleanList(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((s) => String(s).trim()).filter(Boolean)
}
