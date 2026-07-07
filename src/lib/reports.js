// Lightweight flag/report feature. Writes a `reports` doc that only the
// site owner can read/review in the Firebase console.
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function reportContent({
  targetType, // "spot" | "comment"
  spotId,
  commentId,
  reason,
  user,
}) {
  const payload = {
    targetType,
    spotId,
    reason: (reason || '').trim() || 'No reason given',
    reportedBy: user.uid,
    createdAt: serverTimestamp(),
  }
  if (commentId) payload.commentId = commentId
  await addDoc(collection(db, 'reports'), payload)
}
