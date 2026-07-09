import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { getSection, categoryMeta, SORT_OPTIONS } from '../lib/sections'
import { subscribeListings } from '../lib/listings'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { StarDisplay } from '../components/StarRating'
import { SpotCardSkeleton, EmptyState, TagChip } from '../components/bits'
import { NotFound } from './NotFound'

export function SectionList() {
  const { section: key } = useParams()
  const section = getSection(key)
  const reduced = useReducedMotion()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState(section?.hasRating ? 'rating' : 'newest')
  const gridRef = useRef(null)

  useEffect(() => {
    if (!section) return
    setLoading(true)
    const unsub = subscribeListings(
      section.collection,
      (data) => {
        setItems(data)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [section?.collection])

  const visible = useMemo(() => {
    let list = items
    const s = search.trim().toLowerCase()
    if (s) list = list.filter((x) => (x.title || '').toLowerCase().includes(s))
    if (category !== 'all') list = list.filter((x) => x.category === category)
    const arr = [...list]
    if (sortBy === 'votes') arr.sort((a, b) => (b.voteScore || 0) - (a.voteScore || 0))
    else if (sortBy === 'rating')
      arr.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0) || (b.voteScore || 0) - (a.voteScore || 0))
    else arr.sort((a, b) => millis(b.createdAt) - millis(a.createdAt))
    return arr
  }, [items, search, category, sortBy])

  useGSAP(
    () => {
      if (reduced || !gridRef.current) return
      const cards = gridRef.current.querySelectorAll('.spot-card')
      if (cards.length)
        gsap.fromTo(cards, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.4)', stagger: 0.06 })
    },
    { dependencies: [visible.length, sortBy, category], scope: gridRef }
  )

  if (!section) return <NotFound />

  return (
    <div className="container page">
      <section className="section-hero">
        <h1>
          <span aria-hidden="true">{section.emoji}</span> {section.label}
        </h1>
        <p className="muted">{section.tagline}</p>
        <Link to={`/s/${section.key}/add`} className="btn btn-primary">
          ＋ {section.addCta}
        </Link>
      </section>

      <div className="filterbar">
        <div className="filterbar-top">
          <input
            type="search"
            className="search-input"
            placeholder="🔍 Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
            {SORT_OPTIONS.filter((o) => section.hasRating || o.value !== 'rating').map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="chip-row" style={{ marginTop: 12 }}>
          <button className={`chip ${category === 'all' ? 'is-active' : ''}`} onClick={() => setCategory('all')}>All</button>
          {section.categories.map((c) => (
            <button key={c.value} className={`chip ${category === c.value ? 'is-active' : ''}`} onClick={() => setCategory(c.value)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="row spread" style={{ margin: '4px 0 14px' }}>
        <span className="muted">{loading ? 'Loading…' : `${visible.length} ${section.singular}${visible.length === 1 ? '' : 's'}`}</span>
      </div>

      {loading ? (
        <div className="grid">{Array.from({ length: 6 }).map((_, i) => <SpotCardSkeleton key={i} />)}</div>
      ) : visible.length === 0 ? (
        items.length === 0 ? (
          <EmptyState emoji={section.emoji} title={`Nothing here yet`}>
            Be the first — <Link to={`/s/${section.key}/add`}>{section.addCta.toLowerCase()}</Link>.
          </EmptyState>
        ) : (
          <EmptyState emoji="🔍" title="Nothing matches">Try a different search or category.</EmptyState>
        )
      ) : (
        <div className="grid" ref={gridRef}>
          {visible.map((item) => (
            <ListingCard key={item.id} section={section} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListingCard({ section, item }) {
  const cat = categoryMeta(section, item.category)
  return (
    <Link to={`/s/${section.key}/${item.id}`} className="spot-card card">
      {item.photoUrl ? (
        <div className="spot-card-photo">
          <img src={item.photoUrl} alt={item.title} loading="lazy" />
        </div>
      ) : (
        <div className="spot-card-photo spot-card-photo--empty" aria-hidden="true">
          <span>{cat.emoji}</span>
        </div>
      )}
      <div className="spot-card-body">
        <div className="row spread" style={{ alignItems: 'flex-start' }}>
          <h3 className="spot-card-name">{item.title}</h3>
          <span className="badge-score" title="Net votes">
            {item.voteScore > 0 ? `+${item.voteScore}` : item.voteScore || 0}
          </span>
        </div>
        <div className="row row-wrap" style={{ gap: 8, margin: '6px 0 10px' }}>
          <span className="chip">{cat.emoji} {cat.label}</span>
          {item.price && <span className="pill-price">{item.price}</span>}
        </div>
        {section.hasRating && <StarDisplay value={item.avgRating} count={item.ratingCount} />}
        {item.description && <p className="muted card-desc">{item.description}</p>}
        {item.body && <p className="muted card-desc">{item.body}</p>}
        {item.tags?.length > 0 && (
          <div className="chip-row" style={{ marginTop: 10 }}>
            {item.tags.slice(0, 3).map((t) => <TagChip key={t} tag={t} />)}
          </div>
        )}
      </div>
    </Link>
  )
}

function millis(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds) return ts.seconds * 1000
  return 0
}
