import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SpotForm } from '../components/SpotForm'
import { createSpot } from '../lib/spots'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function AddSpot() {
  const { user, displayName } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  async function handleSubmit(data) {
    setBusy(true)
    try {
      const id = await createSpot(data, { uid: user.uid, displayName })
      showToast('Place added! 🎉')
      navigate(`/spot/${id}`)
    } catch (e) {
      console.error(e)
      showToast('Could not save the place. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <Link to="/" className="link-btn back-link">← All places</Link>
      <h1>Add a place</h1>
      <p className="muted">
        Search for a place to auto-fill the details, or enter them by hand. The
        map location and Google Maps link are handled for you.
      </p>
      <SpotForm submitLabel="Add place" onSubmit={handleSubmit} busy={busy} />
    </div>
  )
}
