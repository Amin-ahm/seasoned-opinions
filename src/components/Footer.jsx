import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span className="muted">
          🧂 Seasoned Opinions - honest takes from your coworkers.
        </span>
        <nav className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
