// Lightweight "Report" action for spots and comments.
import { useState } from 'react'
import { Modal } from './Modal'
import { reportContent } from '../lib/reports'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function ReportButton({ targetType, spotId, commentId, compact, col = 'spots' }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await reportContent({ targetType, spotId, commentId, reason, user, collection: col })
      showToast('Thanks - this has been flagged for review.')
      setOpen(false)
      setReason('')
    } catch {
      showToast('Could not submit the report. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        className={compact ? 'link-btn' : 'btn btn-ghost btn-sm'}
        onClick={() => setOpen(true)}
        title="Report this content"
      >
        ⚑ Report
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Report this ${targetType}`}
      >
        <form onSubmit={submit} className="stack">
          <p className="muted" style={{ margin: 0 }}>
            Let the site owner know what's wrong (spam, offensive, copyrighted
            image, wrong info…). Reports are private.
          </p>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="report-reason">Reason</label>
            <textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What's the problem?"
              required
            />
          </div>
          <div className="row spread">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Sending…' : 'Submit report'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
