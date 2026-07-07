import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { SpotForm, spotToForm } from '../components/SpotForm'
import { getSpot, updateSpot } from '../lib/spots'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, EmptyState } from '../components/bits'

export function EditSpot() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [initial, setInitial] = useState(undefined)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSpot(id).then((spot) => {
      if (!spot) return setInitial(null)
      if (spot.createdBy !== user?.uid) return setInitial('forbidden')
      setInitial(spotToForm(spot))
    })
  }, [id, user])

  async function handleSubmit(data) {
    setBusy(true)
    try {
      await updateSpot(id, data)
      showToast('Changes saved ✅')
      navigate(`/spot/${id}`)
    } catch (e) {
      console.error(e)
      showToast('Could not save changes.')
      setBusy(false)
    }
  }

  if (initial === undefined)
    return <div className="container page"><Spinner label="Loading…" /></div>
  if (initial === null)
    return (
      <div className="container page">
        <EmptyState emoji="🤷" title="Spot not found">
          <Link to="/">Back to all spots</Link>.
        </EmptyState>
      </div>
    )
  if (initial === 'forbidden')
    return (
      <div className="container page">
        <EmptyState emoji="🔒" title="You can only edit your own spots">
          <Link to={`/spot/${id}`}>Back to the spot</Link>.
        </EmptyState>
      </div>
    )

  return (
    <div className="container page narrow">
      <Link to={`/spot/${id}`} className="link-btn back-link">← Back to spot</Link>
      <h1>Edit Spot</h1>
      <SpotForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        busy={busy}
      />
    </div>
  )
}
