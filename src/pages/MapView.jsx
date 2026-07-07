import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSpots } from '../hooks/useSpots'
import { Spinner, EmptyState } from '../components/bits'
import { priceString } from '../lib/constants'

const CATEGORY_EMOJI = {
  restaurant: '🍜',
  coffee: '☕',
  bakery: '🥐',
  other: '🍽️',
}

// Whimsical emoji pins via divIcon - no external marker image assets needed.
function emojiIcon(category) {
  return L.divIcon({
    className: 'emoji-pin',
    html: `<div class="emoji-pin-inner">${CATEGORY_EMOJI[category] || '📍'}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -36],
  })
}

export function MapView() {
  const { spots, loading } = useSpots()

  const pinned = useMemo(
    () => spots.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)),
    [spots]
  )

  const center = useMemo(() => {
    if (pinned.length === 0) return [39.5, -98.35]
    const lat = pinned.reduce((a, s) => a + s.lat, 0) / pinned.length
    const lng = pinned.reduce((a, s) => a + s.lng, 0) / pinned.length
    return [lat, lng]
  }, [pinned])

  if (loading)
    return <div className="container page"><Spinner label="Loading map…" /></div>

  return (
    <div className="map-page">
      <div className="container">
        <h1 className="section-title">🗺️ Map of spots</h1>
        <p className="muted" style={{ marginTop: -8 }}>
          {pinned.length} of {spots.length} spots have a location.
          {pinned.length < spots.length &&
            ' Spots without a geocoded address don’t appear here.'}
        </p>
      </div>

      {pinned.length === 0 ? (
        <div className="container">
          <EmptyState emoji="🗺️" title="No mapped spots yet">
            Add a spot with a real address and it'll show up here.
          </EmptyState>
        </div>
      ) : (
        <div className="map-wrap">
          <MapContainer
            center={center}
            zoom={pinned.length === 1 ? 14 : 12}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pinned.map((s) => (
              <Marker key={s.id} position={[s.lat, s.lng]} icon={emojiIcon(s.category)}>
                <Popup>
                  <div className="map-popup">
                    <strong>{s.name}</strong>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {priceString(s.priceScale)} ·{' '}
                      {s.avgRating ? `★ ${s.avgRating.toFixed(1)}` : 'unrated'}
                    </div>
                    <Link to={`/spot/${s.id}`}>View spot →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
