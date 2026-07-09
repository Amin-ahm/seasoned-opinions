import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useSpots } from '../hooks/useSpots'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { SpotCard } from '../components/SpotCard'
import { FilterBar } from '../components/FilterBar'
import { SpotCardSkeleton, EmptyState } from '../components/bits'
import { SECTION_LIST } from '../lib/sections'
import {
  DEFAULT_FILTERS,
  filterSpots,
  sortSpots,
  hasActiveFilters,
} from '../lib/filters'

const HeroScene = lazy(() => import('../components/three/HeroScene'))

export function Home() {
  const { spots, loading } = useSpots()
  const reduced = useReducedMotion()
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [sortBy, setSortBy] = useState('rating')
  const gridRef = useRef(null)

  const allTags = useMemo(() => {
    const set = new Set()
    spots.forEach((s) => (s.tags || []).forEach((t) => set.add(t)))
    return Array.from(set)
  }, [spots])

  const visible = useMemo(() => {
    return sortSpots(filterSpots(spots, filters), sortBy)
  }, [spots, filters, sortBy])

  const trending = useMemo(() => {
    return [...spots]
      .filter((s) => (s.voteScore || 0) > 0)
      .sort((a, b) => (b.voteScore || 0) - (a.voteScore || 0))
      .slice(0, 6)
  }, [spots])

  useGSAP(
    () => {
      if (reduced || !gridRef.current) return
      const cards = gridRef.current.querySelectorAll('.spot-card')
      if (!cards.length) return
      gsap.fromTo(
        cards,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.4)',
          stagger: 0.06,
        }
      )
    },
    { dependencies: [visible.length, sortBy], scope: gridRef }
  )

  const filtering = hasActiveFilters(filters)

  return (
    <div className="container page">
      <section className="home-hero">
        <div className="home-hero-text">
          <h1>The good stuff, crowdsourced.</h1>
          <p className="muted">
            Real recommendations from your coworkers on the places worth going,
            the people worth hiring, and the things worth trying. Rate the
            winners, flag the duds, and let the wheel decide when you can't.
          </p>
          <div className="row row-wrap" style={{ gap: 10 }}>
            <Link to="/add" className="btn btn-primary">
              ＋ Add a place
            </Link>
            <Link to="/decide" className="btn btn-grape">
              🎡 Decide for Me
            </Link>
          </div>
        </div>
        <div className="home-hero-3d" aria-hidden="true">
          {!reduced && (
            <Suspense fallback={<div className="hero-fallback" />}>
              <HeroScene />
            </Suspense>
          )}
        </div>
      </section>

      <section className="explore-strip">
        {SECTION_LIST.map((s) => (
          <Link key={s.key} to={`/s/${s.key}`} className="explore-pill">
            <span className="explore-emoji" aria-hidden="true">{s.emoji}</span>
            <span>
              <strong>{s.label}</strong>
              <span className="muted explore-sub">{s.tagline}</span>
            </span>
          </Link>
        ))}
      </section>

      {trending.length > 0 && (
        <section className="trending">
          <h2 className="section-title">🔥 Trending this week</h2>
          <div className="trending-strip">
            {trending.map((s) => (
              <Link key={s.id} to={`/spot/${s.id}`} className="trending-pill">
                <span className="trending-rank">＋{s.voteScore}</span>
                <span className="trending-name">{s.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allTags={allTags}
      />

      <div className="row spread" style={{ margin: '4px 0 14px' }}>
        <span className="muted">
          {loading ? 'Loading…' : `${visible.length} spot${visible.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpotCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        spots.length === 0 ? (
          <EmptyState emoji="📍" title="No places yet">
            Be the first. <Link to="/add">Add a place</Link> and get the list
            started.
          </EmptyState>
        ) : (
          <EmptyState emoji="🔍" title="Nothing matches those filters">
            Try loosening things up{filtering ? ' or clearing the filters.' : '.'}
          </EmptyState>
        )
      ) : (
        <div className="grid" ref={gridRef}>
          {visible.map((s) => (
            <SpotCard key={s.id} spot={s} />
          ))}
        </div>
      )}
    </div>
  )
}
