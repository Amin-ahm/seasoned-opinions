// Up/down vote widget. One vote per user (uid-keyed doc). Reflects the
// current user's existing vote and updates the spot's voteScore atomically.
import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { castVote, subscribeMyVote } from '../lib/interactions'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function VoteControls({ spotId, score = 0, size = 'md', col = 'spots' }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const reduced = useReducedMotion()
  const [myVote, setMyVote] = useState(0)
  const [busy, setBusy] = useState(false)
  const scoreRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeMyVote(spotId, user.uid, setMyVote, col)
    return unsub
  }, [spotId, user, col])

  useGSAP(
    () => {
      if (reduced || !scoreRef.current) return
      gsap.fromTo(
        scoreRef.current,
        { scale: 1.4 },
        { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }
      )
    },
    { dependencies: [score], scope: scoreRef }
  )

  async function vote(value) {
    if (!user || busy) return
    setBusy(true)
    try {
      await castVote(spotId, user.uid, value, col)
    } catch (e) {
      showToast('Could not save your vote. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`vote-controls ${size === 'sm' ? 'vote-sm' : ''}`}>
      <button
        className={`vote-btn ${myVote === 1 ? 'up-active' : ''}`}
        aria-label="Upvote"
        aria-pressed={myVote === 1}
        disabled={busy}
        onClick={() => vote(1)}
      >
        ▲
      </button>
      <span
        className="vote-score"
        ref={scoreRef}
        style={{ color: score > 0 ? 'var(--teal-dark)' : score < 0 ? 'var(--skip)' : 'var(--ink-soft)' }}
      >
        {score}
      </span>
      <button
        className={`vote-btn ${myVote === -1 ? 'down-active' : ''}`}
        aria-label="Downvote"
        aria-pressed={myVote === -1}
        disabled={busy}
        onClick={() => vote(-1)}
      >
        ▼
      </button>
    </div>
  )
}
