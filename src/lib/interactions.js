// Votes, ratings and comments.
//
// One vote and one rating per person, enforced by keying the docs to the
// user's uid. The parent spot's denormalized counters (voteScore, avgRating,
// ratingCount) are updated in the SAME transaction, so no Cloud Function
// (and therefore no billing) is needed.
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

/* ----------------------------- Votes ----------------------------- */

/**
 * Cast (or toggle) a vote. `value` is 1 or -1. Clicking the current vote
 * again removes it. Updates spot.voteScore atomically.
 */
export async function castVote(spotId, uid, value) {
  const spotRef = doc(db, 'spots', spotId)
  const voteRef = doc(db, 'spots', spotId, 'votes', uid)

  await runTransaction(db, async (tx) => {
    const spotSnap = await tx.get(spotRef)
    if (!spotSnap.exists()) throw new Error('Spot no longer exists')
    const voteSnap = await tx.get(voteRef)

    const oldValue = voteSnap.exists() ? voteSnap.data().value : 0
    const toggleOff = oldValue === value
    const newValue = toggleOff ? 0 : value
    const delta = newValue - oldValue

    const currentScore = spotSnap.data().voteScore || 0
    tx.update(spotRef, { voteScore: currentScore + delta })

    if (toggleOff) {
      tx.delete(voteRef)
    } else {
      tx.set(voteRef, { value: newValue })
    }
  })
}

export function subscribeMyVote(spotId, uid, cb) {
  const voteRef = doc(db, 'spots', spotId, 'votes', uid)
  return onSnapshot(voteRef, (snap) =>
    cb(snap.exists() ? snap.data().value : 0)
  )
}

/* ----------------------------- Ratings ----------------------------- */

/**
 * Set the current user's star rating (1–5). Recomputes avgRating and
 * ratingCount on the parent spot atomically.
 */
export async function setRating(spotId, uid, stars) {
  const clamped = Math.max(1, Math.min(5, Math.round(stars)))
  const spotRef = doc(db, 'spots', spotId)
  const ratingRef = doc(db, 'spots', spotId, 'ratings', uid)

  await runTransaction(db, async (tx) => {
    const spotSnap = await tx.get(spotRef)
    if (!spotSnap.exists()) throw new Error('Spot no longer exists')
    const ratingSnap = await tx.get(ratingRef)

    const data = spotSnap.data()
    const count = data.ratingCount || 0
    const avg = data.avgRating || 0
    const total = avg * count

    let newCount
    let newTotal
    if (ratingSnap.exists()) {
      const old = ratingSnap.data().stars || 0
      newCount = count
      newTotal = total - old + clamped
    } else {
      newCount = count + 1
      newTotal = total + clamped
    }
    const newAvg = newCount > 0 ? newTotal / newCount : 0

    tx.set(ratingRef, { stars: clamped })
    tx.update(spotRef, {
      ratingCount: newCount,
      avgRating: Math.round(newAvg * 100) / 100,
    })
  })
}

export function subscribeMyRating(spotId, uid, cb) {
  const ratingRef = doc(db, 'spots', spotId, 'ratings', uid)
  return onSnapshot(ratingRef, (snap) =>
    cb(snap.exists() ? snap.data().stars : 0)
  )
}

/** For "Something New" mode - which spots has this user already rated? */
export async function hasUserRated(spotId, uid) {
  const snap = await getDoc(doc(db, 'spots', spotId, 'ratings', uid))
  return snap.exists()
}

/* ----------------------------- Comments ----------------------------- */

export function subscribeComments(spotId, cb, onError) {
  const q = query(
    collection(db, 'spots', spotId, 'comments'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export async function addComment(spotId, user, text) {
  const clean = text.trim()
  if (!clean) return
  await addDoc(collection(db, 'spots', spotId, 'comments'), {
    text: clean,
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    createdAt: serverTimestamp(),
  })
}

export async function deleteComment(spotId, commentId) {
  await deleteDoc(doc(db, 'spots', spotId, 'comments', commentId))
}
