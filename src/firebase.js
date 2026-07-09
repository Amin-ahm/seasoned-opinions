// Firebase initialization.
//
// The Firebase web config is read ENTIRELY from Vite env vars, nothing is
// hardcoded here. Provide the values via:
//   - local dev: a `.env.local` file (gitignored) with the VITE_FIREBASE_* keys
//   - CI / GitHub Pages: repository Actions secrets of the same names, passed
//     through in .github/workflows/deploy.yml
//
// Note: a web app's Firebase config is inherently visible in the shipped JS
// bundle (the browser needs it to reach Firebase), env vars keep it out of the
// source repo, not out of the client. Real security comes from the Firestore
// rules (firestore.rules) and the Auth authorized-domains list.
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export default app
