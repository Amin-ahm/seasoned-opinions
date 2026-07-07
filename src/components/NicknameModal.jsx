// Lets a signed-in user choose the nickname shown on their spots and comments.
import { useState } from 'react'
import { Modal } from './Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function NicknameModal({ open, onClose, firstTime }) {
  const { user, profile, updateNickname } = useAuth()
  const { showToast } = useToast()
  const [value, setValue] = useState(profile?.nickname || '')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await updateNickname(value)
      showToast(value.trim() ? 'Nickname saved 🎉' : 'Nickname cleared')
      onClose?.()
    } catch {
      showToast('Could not save your nickname.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={firstTime ? 'Pick a nickname' : 'Your nickname'}
    >
      <form onSubmit={submit} className="stack">
        <p className="muted" style={{ margin: 0 }}>
          This is the name shown on the spots and comments you post. Leave it
          blank to use your Google name
          {user?.displayName ? ` (${user.displayName})` : ''}.
        </p>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            type="text"
            value={value}
            maxLength={40}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Taco Scout"
            autoFocus
          />
          <p className="hint">Up to 40 characters.</p>
        </div>
        <div className="row spread">
          {!firstTime && (
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : firstTime ? 'Save & continue' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
