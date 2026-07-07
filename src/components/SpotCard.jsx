import { Link } from 'react-router-dom'
import {
  PriceScale,
  CategoryChip,
  TagChip,
  AvailabilityChip,
} from './bits'
import { StarDisplay } from './StarRating'

export function SpotCard({ spot }) {
  return (
    <Link to={`/spot/${spot.id}`} className="spot-card card">
      {spot.photoUrl ? (
        <div className="spot-card-photo">
          <img src={spot.photoUrl} alt={spot.name} loading="lazy" />
        </div>
      ) : (
        <div className="spot-card-photo spot-card-photo--empty" aria-hidden="true">
          <span>{categoryEmoji(spot.category)}</span>
        </div>
      )}

      <div className="spot-card-body">
        <div className="row spread" style={{ alignItems: 'flex-start' }}>
          <h3 className="spot-card-name">{spot.name}</h3>
          <span className="badge-score" title="Net votes">
            {spot.voteScore > 0 ? `+${spot.voteScore}` : spot.voteScore || 0}
          </span>
        </div>

        <div className="row row-wrap" style={{ gap: 8, margin: '6px 0 10px' }}>
          <CategoryChip category={spot.category} />
          <PriceScale scale={spot.priceScale} />
        </div>

        <StarDisplay value={spot.avgRating} count={spot.ratingCount} />

        {spot.tags?.length > 0 && (
          <div className="chip-row" style={{ marginTop: 10 }}>
            {spot.tags.slice(0, 3).map((t) => (
              <TagChip key={t} tag={t} />
            ))}
            {spot.tags.length > 3 && (
              <span className="chip">+{spot.tags.length - 3}</span>
            )}
          </div>
        )}

        {spot.availability?.length > 0 && (
          <div className="chip-row" style={{ marginTop: 8 }}>
            {spot.availability.slice(0, 4).map((a) => (
              <AvailabilityChip key={a} value={a} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

function categoryEmoji(cat) {
  return { restaurant: '🍜', coffee: '☕', bakery: '🥐' }[cat] || '🍽️'
}
