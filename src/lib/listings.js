// Generic CRUD + live subscriptions for the non-place sections (market,
// software, news). Places keep their own richer module (spots.js) because they
// add geocoding + a map. Everything here is collection-agnostic.
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
import { normalizeUrl } from './mapsLinks'

// Fields of type 'url' get normalized; 'tags' get cleaned to a deduped array.
function cleanData(fields, data) {
  const out = {}
  for (const f of fields) {
    const v = data[f.key]
    if (f.type === 'tags') {
      out[f.key] = dedupe(Array.isArray(v) ? v : [])
    } else if (f.type === 'url') {
      out[f.key] = normalizeUrl(v) || null
    } else if (f.type === 'number') {
      out[f.key] = v === '' || v == null ? null : Number(v)
    } else {
      out[f.key] = typeof v === 'string' ? v.trim() : v ?? null
    }
  }
  return out
}

export async function createListing(col, fields, data, user) {
  const payload = {
    ...cleanData(fields, data),
    createdBy: user.uid,
    createdByName: user.displayName || 'Anonymous',
    createdAt: serverTimestamp(),
    avgRating: 0,
    ratingCount: 0,
    voteScore: 0,
  }
  const ref = await addDoc(collection(db, col), payload)
  return ref.id
}

export async function updateListing(col, id, fields, data) {
  await updateDoc(doc(db, col, id), cleanData(fields, data))
}

export async function deleteListing(col, id) {
  await deleteDoc(doc(db, col, id))
}

export async function getListing(col, id) {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function subscribeListings(col, onData, onError) {
  const q = query(collection(db, col), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export function subscribeListing(col, id, onData, onError) {
  return onSnapshot(
    doc(db, col, id),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  )
}

export async function fetchListingsOnce(col) {
  const snap = await getDocs(query(collection(db, col), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

function dedupe(arr) {
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
