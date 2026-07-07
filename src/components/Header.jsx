import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { NicknameModal } from './NicknameModal'

export function Header() {
  const { user, displayName, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [nickOpen, setNickOpen] = useState(false)

  const firstName = displayName?.split(' ')[0] || 'You'

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-emoji" aria-hidden="true">
            🧂
          </span>
          <span className="brand-name">Seasoned Opinions</span>
          <span className="brand-by">by Read Team</span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Spots
          </NavLink>
          <NavLink to="/map" onClick={() => setMenuOpen(false)}>
            Map
          </NavLink>
          <NavLink to="/decide" onClick={() => setMenuOpen(false)}>
            Decide for Me
          </NavLink>
          <NavLink
            to="/add"
            className="nav-add"
            onClick={() => setMenuOpen(false)}
          >
            ＋ Add a Spot
          </NavLink>
          {/* Nickname entry inside the mobile dropdown */}
          <button
            className="nav-mobile-only link-btn"
            onClick={() => {
              setMenuOpen(false)
              setNickOpen(true)
            }}
          >
            ✏️ Edit nickname
          </button>
        </nav>

        <div className="header-right">
          {user && (
            <div className="user-chip">
              <button
                className="user-chip-btn"
                onClick={() => setNickOpen(true)}
                title="Edit your nickname"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="avatar" />
                ) : (
                  <span className="avatar avatar-fallback" aria-hidden="true">
                    {firstName.charAt(0)}
                  </span>
                )}
                <span className="user-name">{firstName}</span>
              </button>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>
                Sign out
              </button>
            </div>
          )}
          <button
            className="hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <NicknameModal open={nickOpen} onClose={() => setNickOpen(false)} />
    </header>
  )
}
