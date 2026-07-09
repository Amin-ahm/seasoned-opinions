// Votes, ratings and comments — shared across every section (places, market,
// software, news) by passing the parent collection name (`col`). Defaults to
// 'spots' so the original Places code keeps working unchanged.
//
// One vote and one rating per person, enforced by keying the docs to the
// user's uid. The parent item's denormalized counters (voteScore, avgRating,
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

export async function castVote(itemId, uid, value, col = 'spots') {
  const itemRef = doc(db, col, itemId)
  const voteRef = doc(db, col, itemId, 'votes', uid)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(itemRef)
    if (!snap.exists()) throw new Error('Item no longer exists')
    const voteSnap = await tx.get(voteRef)

    const oldValue = voteSnap.exists() ? voteSnap.data().value : 0
    const toggleOff = oldValue === value
    const newValue = toggleOff ? 0 : value
    const delta = newValue - oldValue

    const currentScore = snap.data().voteScore || 0
    tx.update(itemRef, { voteScore: currentScore + delta })

    if (toggleOff) tx.delete(voteRef)
    else tx.set(voteRef, { value: newValue })
  })
}

export function subscribeMyVote(itemId, uid, cb, col = 'spots') {
  return onSnapshot(doc(db, col, itemId, 'votes', uid), (snap) =>
    cb(snap.exists() ? snap.data().value : 0)
  )
}

/* ----------------------------- Ratings ----------------------------- */

export async function setRating(itemId, uid, stars, col = 'spots') {
  const clamped = Math.max(1, Math.min(5, Math.round(stars)))
  const itemRef = doc(db, col, itemId)
  const ratingRef = doc(db, col, itemId, 'ratings', uid)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(itemRef)
    if (!snap.exists()) throw new Error('Item no longer exists')
    const ratingSnap = await tx.get(ratingRef)

    const data = snap.data()
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
    tx.update(itemRef, {
      ratingCount: newCount,
      avgRating: Math.round(newAvg * 100) / 100,
    })
  })
}

export function subscribeMyRating(itemId, uid, cb, col = 'spots') {
  return onSnapshot(doc(db, col, itemId, 'ratings', uid), (snap) =>
    cb(snap.exists() ? snap.data().stars : 0)
  )
}

/** For "Something New" mode — which items has this user already rated? */
export async function hasUserRated(itemId, uid, col = 'spots') {
  const snap = await getDoc(doc(db, col, itemId, 'ratings', uid))
  return snap.exists()
}

/* ----------------------------- Comments ----------------------------- */

export function subscribeComments(itemId, cb, onError, col = 'spots') {
  const q = query(
    collection(db, col, itemId, 'comments'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export async function addComment(itemId, user, text, col = 'spots') {
  const clean = text.trim()
  if (!clean) return
  await addDoc(collection(db, col, itemId, 'comments'), {
    text: clean,
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    createdAt: serverTimestamp(),
  })
}

export async function deleteComment(itemId, commentId, col = 'spots') {
  await deleteDoc(doc(db, col, itemId, 'comments', commentId))
}
