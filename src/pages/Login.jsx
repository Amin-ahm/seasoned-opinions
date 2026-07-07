// The only screen an unauthenticated visitor can see. Everything else is
// gated behind Google sign-in.
import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { isFirebaseConfigured } from '../firebase'

const HeroScene = lazy(() => import('../components/three/HeroScene'))

export function Login() {
  const { signIn, error } = useAuth()
  const reduced = useReducedMotion()

  return (
    <div className="login-screen">
      <div className="login-hero3d" aria-hidden="true">
        {!reduced && (
          <Suspense fallback={<div className="hero-fallback" />}>
            <HeroScene simplified />
          </Suspense>
        )}
      </div>

      <div className="login-card card">
        <div className="brand brand-lg">
          <span className="brand-emoji" aria-hidden="true">
            🧂
          </span>
          <span className="brand-name">Seasoned Opinions</span>
        </div>
        <h1>Where should you eat?</h1>
        <p className="muted login-tagline">
          The crowdsourced guide to the restaurants, coffee shops, and bakeries
          near work, with honest ratings, what's good, what to skip, and a
          "Decide for Me" button for when you can't pick.
        </p>

        {!isFirebaseConfigured && (
          <p className="config-warning">
            ⚠️ Firebase isn't configured yet. Add your web config in{' '}
            <code>src/firebase.js</code> to enable sign-in.
          </p>
        )}

        <button
          className="btn btn-google btn-block"
          onClick={signIn}
          disabled={!isFirebaseConfigured}
        >
          <GoogleIcon /> Sign in with Google
        </button>

        {error && <p className="config-warning">{error}</p>}

        <p className="login-legal muted">
          By signing in you agree to our <Link to="/terms">Terms</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
