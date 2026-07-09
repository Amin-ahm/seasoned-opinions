import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSection, categoryMeta } from '../lib/sections'
import { subscribeListing, deleteListing } from '../lib/listings'
import { setRating, subscribeMyRating } from '../lib/interactions'
import { normalizeUrl } from '../lib/mapsLinks'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { StarDisplay, StarPicker } from '../components/StarRating'
import { VoteControls } from '../components/VoteControls'
import { Comments } from '../components/Comments'
import { ReportButton } from '../components/ReportButton'
import { Modal } from '../components/Modal'
import { Spinner, EmptyState, TagChip } from '../components/bits'
import { formatWhen } from '../lib/time'
import { NotFound } from './NotFound'

export function SectionDetail() {
  const { section: key, id } = useParams()
  const section = getSection(key)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [item, setItem] = useState(undefined)
  const [myRating, setMyRating] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const col = section?.collection

  useEffect(() => {
    if (!col) return
    const unsub = subscribeListing(col, id, setItem, () => setItem(null))
    return unsub
  }, [col, id])

  useEffect(() => {
    if (!user || !section?.hasRating || !col) return
    const unsub = subscribeMyRating(id, user.uid, setMyRating, col)
    return unsub
  }, [col, id, user, section?.hasRating])

  if (!section) return <NotFound />
  if (item === undefined) return <div className="container page"><Spinner label="Loading…" /></div>
  if (item === null)
    return (
      <div className="container page">
        <EmptyState emoji="🤷" title="Not found">
          <Link to={`/s/${section.key}`}>Back to {section.label}</Link>.
        </EmptyState>
      </div>
    )

  const isOwner = user?.uid === item.createdBy
  const cat = categoryMeta(section, item.category)
  const link = normalizeUrl(item.link)

  async function rate(stars) {
    try {
      await setRating(id, user.uid, stars, col)
      showToast(`Rated ${stars} star${stars > 1 ? 's' : ''} ⭐`)
    } catch {
      showToast('Could not save your rating.')
    }
  }

  async function onDelete() {
    try {
      await deleteListing(col, id)
      showToast('Deleted.')
      navigate(`/s/${section.key}`)
    } catch {
      showToast('Could not delete.')
    }
  }

  return (
    <div className="container page detail">
      <Link to={`/s/${section.key}`} className="link-btn back-link">← {section.label}</Link>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="row spread" style={{ alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ marginBottom: 6 }}>{item.title}</h1>
              <div className="row row-wrap" style={{ gap: 8 }}>
                <span className="chip">{cat.emoji} {cat.label}</span>
                {item.price && <span className="pill-price">{item.price}</span>}
              </div>
            </div>
            <VoteControls spotId={item.id} score={item.voteScore || 0} col={col} />
          </div>

          {item.photoUrl && (
            <div className="detail-photo card">
              <img src={item.photoUrl} alt={item.title} loading="lazy" />
            </div>
          )}

          {section.hasRating && (
            <div className="row row-wrap" style={{ gap: 14, margin: '14px 0' }}>
              <StarDisplay value={item.avgRating} count={item.ratingCount} size="1.35rem" />
            </div>
          )}

          {(item.description || item.body) && (
            <p className="detail-body">{item.description || item.body}</p>
          )}

          {item.tags?.length > 0 && (
            <div className="chip-row" style={{ margin: '16px 0' }}>
              {item.tags.map((t) => <TagChip key={t} tag={t} />)}
            </div>
          )}

          <Comments spotId={item.id} col={col} />
        </div>

        <aside className="detail-side">
          {section.hasRating && (
            <div className="card side-card">
              <h3>Your rating</h3>
              <StarPicker value={myRating} onRate={rate} />
              <p className="hint">{myRating ? 'Tap a different star to change it.' : 'Tap to rate.'}</p>
            </div>
          )}

          {link && (
            <div className="card side-card">
              <h3>Link</h3>
              <a className="btn btn-block" href={link} target="_blank" rel="noreferrer noopener">
                🔗 Open link
              </a>
            </div>
          )}

          <div className="card side-card">
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              Shared by {item.createdByName} · {formatWhen(item.createdAt)}
            </p>
            <div className="row row-wrap" style={{ gap: 8, marginTop: 12 }}>
              {isOwner && (
                <>
                  <Link to={`/s/${section.key}/${item.id}/edit`} className="btn btn-ghost btn-sm">✏️ Edit</Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(true)}>🗑️ Delete</button>
                </>
              )}
              <ReportButton targetType="spot" spotId={item.id} col={col} />
            </div>
          </div>
        </aside>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this?">
        <p>This permanently removes “{item.title}” and its comments. This can't be undone.</p>
        <div className="row spread">
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={onDelete}>Delete it</button>
        </div>
      </Modal>
    </div>
  )
}
