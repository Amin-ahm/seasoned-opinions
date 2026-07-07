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
      showToast('Spot added! 🎉')
      navigate(`/spot/${id}`)
    } catch (e) {
      console.error(e)
      showToast('Could not save the spot. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <Link to="/" className="link-btn back-link">← All spots</Link>
      <h1>Add a Spot</h1>
      <p className="muted">
        Share a place worth knowing about. Geocoding and the Google Maps link
        happen automatically.
      </p>
      <SpotForm submitLabel="Add spot" onSubmit={handleSubmit} busy={busy} />
    </div>
  )
}
