// Comment thread for a spot. Signed-in users can post; authors delete their own.
import { useEffect, useState } from 'react'
import {
  subscribeComments,
  addComment,
  deleteComment,
} from '../lib/interactions'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ReportButton } from './ReportButton'
import { Spinner } from './bits'
import { formatWhen } from '../lib/time'

export function Comments({ spotId, col = 'spots' }) {
  const { user, displayName } = useAuth()
  const { showToast } = useToast()
  const [comments, setComments] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const unsub = subscribeComments(
      spotId,
      setComments,
      () => setComments([]),
      col
    )
    return unsub
  }, [spotId, col])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await addComment(spotId, { uid: user.uid, displayName }, text, col)
      setText('')
    } catch {
      showToast('Could not post your comment.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    try {
      await deleteComment(spotId, id, col)
    } catch {
      showToast('Could not delete the comment.')
    }
  }

  return (
    <section className="comments">
      <h3 className="section-title">
        💬 Comments {comments ? `(${comments.length})` : ''}
      </h3>

      <form onSubmit={submit} className="comment-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share a tip, warning, or favorite order…"
          maxLength={1000}
          rows={2}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={busy || !text.trim()}
        >
          Post
        </button>
      </form>

      {comments === null ? (
        <Spinner label="Loading comments…" />
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet - be the first!</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="row spread">
                <strong>{c.authorName}</strong>
                <span className="muted comment-time">
                  {formatWhen(c.createdAt)}
                </span>
              </div>
              <p className="comment-text">{c.text}</p>
              <div className="row" style={{ gap: 12 }}>
                {user?.uid === c.authorId && (
                  <button
                    className="link-btn danger"
                    onClick={() => remove(c.id)}
                  >
                    Delete
                  </button>
                )}
                <ReportButton
                  targetType="comment"
                  spotId={spotId}
                  commentId={c.id}
                  col={col}
                  compact
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
