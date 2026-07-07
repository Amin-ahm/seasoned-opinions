// Auth state for the whole app. The entire site is gated behind Google
// sign-in; this provider exposes the current user (or null), the editable
// profile (including a chosen nickname), plus sign in/out helpers. It upserts
// the users/{uid} profile doc on first login without clobbering the nickname.
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        // Merge the Google profile fields. We intentionally do NOT write a
        // nickname here, so a previously chosen nickname is preserved.
        try {
          await setDoc(
            doc(db, 'users', u.uid),
            {
              displayName: u.displayName || 'Anonymous',
              email: u.email || null,
              photoURL: u.photoURL || null,
              lastLoginAt: serverTimestamp(),
            },
            { merge: true }
          )
        } catch (e) {
          // Non-fatal: the app still works if the profile write fails.
          console.warn('Could not upsert user profile:', e)
        }
      } else {
        setProfile(null)
      }
    })
    return unsub
  }, [])

  // Live subscription to the profile doc so nickname changes reflect instantly.
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : {})
    })
    return unsub
  }, [user])

  async function signIn() {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        setError(e?.message || 'Sign-in failed. Please try again.')
      }
    }
  }

  async function signOut() {
    await fbSignOut(auth)
  }

  async function updateNickname(nickname) {
    if (!user) return
    const clean = (nickname || '').trim().slice(0, 40)
    await setDoc(
      doc(db, 'users', user.uid),
      { nickname: clean || null },
      { merge: true }
    )
  }

  // The name shown everywhere: chosen nickname wins, else the Google name.
  const displayName =
    profile?.nickname || user?.displayName || 'Anonymous'

  // True once we know the profile has loaded and no nickname was ever set.
  const needsNickname = !!user && profile !== null && !profile?.nickname

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        displayName,
        needsNickname,
        loading,
        error,
        signIn,
        signOut,
        updateNickname,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
