import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { subscribeSpot, deleteSpot } from '../lib/spots'
import { setRating, subscribeMyRating } from '../lib/interactions'
import { mapsSearchUrl, mapsDirectionsUrl } from '../lib/mapsLinks'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { StarDisplay, StarPicker } from '../components/StarRating'
import { VoteControls } from '../components/VoteControls'
import { Comments } from '../components/Comments'
import { ReportButton } from '../components/ReportButton'
import { Modal } from '../components/Modal'
import { Spinner, EmptyState, PriceScale, CategoryChip, TagChip, AvailabilityChip } from '../components/bits'
import { isFoodCategory } from '../lib/constants'
import { formatWhen } from '../lib/time'

export function SpotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [spot, setSpot] = useState(undefined) // undefined = loading, null = gone
  const [myRating, setMyRating] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const unsub = subscribeSpot(id, setSpot, () => setSpot(null))
    return unsub
  }, [id])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeMyRating(id, user.uid, setMyRating)
    return unsub
  }, [id, user])

  async function rate(stars) {
    try {
      await setRating(id, user.uid, stars)
      showToast(`Rated ${stars} star${stars > 1 ? 's' : ''} ⭐`)
    } catch {
      showToast('Could not save your rating.')
    }
  }

  async function onDelete() {
    try {
      await deleteSpot(id)
      showToast('Spot deleted.')
      navigate('/')
    } catch {
      showToast('Could not delete the spot.')
    }
  }

  if (spot === undefined) return <div className="container page"><Spinner label="Loading spot…" /></div>
  if (spot === null)
    return (
      <div className="container page">
        <EmptyState emoji="🤷" title="Spot not found">
          It may have been removed. <Link to="/">Back to all spots</Link>.
        </EmptyState>
      </div>
    )

  const isOwner = user?.uid === spot.createdBy
  const links = spot.orderLinks || {}
  const food = isFoodCategory(spot.category)

  return (
    <div className="container page detail">
      <Link to="/" className="link-btn back-link">← All spots</Link>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="row spread" style={{ alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ marginBottom: 6 }}>{spot.name}</h1>
              <div className="row row-wrap" style={{ gap: 8 }}>
                <CategoryChip category={spot.category} />
                <PriceScale scale={spot.priceScale} />
              </div>
            </div>
            <VoteControls spotId={spot.id} score={spot.voteScore || 0} />
          </div>

          {spot.photoUrl && (
            <div className="detail-photo card">
              <img src={spot.photoUrl} alt={spot.name} loading="lazy" />
            </div>
          )}

          <div className="row row-wrap" style={{ gap: 14, margin: '14px 0' }}>
            <StarDisplay value={spot.avgRating} count={spot.ratingCount} size="1.35rem" />
          </div>

          <p className="detail-address muted">📍 {spot.address}</p>

          {spot.tags?.length > 0 && (
            <div className="chip-row" style={{ marginBottom: 16 }}>
              {spot.tags.map((t) => (
                <TagChip key={t} tag={t} />
              ))}
            </div>
          )}

          {(spot.whatsGood?.length > 0 || spot.whatToSkip?.length > 0) && (
            <div className="goodskip">
              {spot.whatsGood?.length > 0 && (
                <div className="goodskip-col good">
                  <h3>✅ What's good</h3>
                  <ul>
                    {spot.whatsGood.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {spot.whatToSkip?.length > 0 && (
                <div className="goodskip-col skip">
                  <h3>⛔ What to skip</h3>
                  <ul>
                    {spot.whatToSkip.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Comments spotId={spot.id} />
        </div>

        <aside className="detail-side">
          <div className="card side-card">
            <h3>Your rating</h3>
            <StarPicker value={myRating} onRate={rate} />
            <p className="hint">{myRating ? 'Tap a different star to change it.' : 'Tap to rate this spot.'}</p>
          </div>

          <div className="card side-card">
            <h3>Find it</h3>
            <div className="stack" style={{ gap: 10 }}>
              <a className="btn btn-block" href={mapsSearchUrl(spot.address)} target="_blank" rel="noreferrer noopener">
                🗺️ Open in Google Maps
              </a>
              <a className="btn btn-block" href={mapsDirectionsUrl(spot.address)} target="_blank" rel="noreferrer noopener">
                🧭 Directions
              </a>
              {links.website && (
                <a className="btn btn-block" href={links.website} target="_blank" rel="noreferrer noopener">
                  🔗 Website
                </a>
              )}
              {food && links.doordash && (
                <a className="btn btn-block" href={links.doordash} target="_blank" rel="noreferrer noopener">
                  🚗 Order on DoorDash
                </a>
              )}
              {food && links.ubereats && (
                <a className="btn btn-block" href={links.ubereats} target="_blank" rel="noreferrer noopener">
                  🛵 Order on Uber Eats
                </a>
              )}
            </div>
          </div>

          {food && spot.availability?.length > 0 && (
            <div className="card side-card">
              <h3>Ways to get it</h3>
              <div className="chip-row">
                {spot.availability.map((a) => (
                  <AvailabilityChip key={a} value={a} />
                ))}
              </div>
            </div>
          )}

          <div className="card side-card">
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              Added by {spot.createdByName} · {formatWhen(spot.createdAt)}
            </p>
            <div className="row row-wrap" style={{ gap: 8, marginTop: 12 }}>
              {isOwner && (
                <>
                  <Link to={`/spot/${spot.id}/edit`} className="btn btn-ghost btn-sm">
                    ✏️ Edit
                  </Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(true)}>
                    🗑️ Delete
                  </button>
                </>
              )}
              <ReportButton targetType="spot" spotId={spot.id} />
            </div>
          </div>
        </aside>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this spot?">
        <p>This permanently removes “{spot.name}” and its comments. This can't be undone.</p>
        <div className="row spread">
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onDelete}>
            Delete it
          </button>
        </div>
      </Modal>
    </div>
  )
}
