import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSection } from '../lib/sections'
import { createListing, updateListing, getListing } from '../lib/listings'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, EmptyState } from '../components/bits'
import { NotFound } from './NotFound'

function blankForm(section) {
  const f = {}
  for (const field of section.fields) {
    if (field.type === 'tags') f[field.key] = []
    else if (field.type === 'select') f[field.key] = section.categories?.[0]?.value || ''
    else f[field.key] = ''
  }
  return f
}

function toForm(section, item) {
  const f = blankForm(section)
  for (const field of section.fields) {
    if (field.key in item && item[field.key] != null) f[field.key] = item[field.key]
  }
  return f
}

export function SectionEditor({ mode }) {
  const { section: key, id } = useParams()
  const section = getSection(key)
  const { user, displayName } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [form, setForm] = useState(section ? blankForm(section) : {})
  const [ready, setReady] = useState(!isEdit)
  const [state, setState] = useState('ok') // ok | notfound | forbidden
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [customTag, setCustomTag] = useState('')

  useEffect(() => {
    if (!section || !isEdit) return
    getListing(section.collection, id).then((item) => {
      if (!item) return setState('notfound')
      if (item.createdBy !== user?.uid) return setState('forbidden')
      setForm(toForm(section, item))
      setReady(true)
    })
  }, [section?.collection, id, isEdit, user])

  if (!section) return <NotFound />
  if (isEdit && state === 'notfound')
    return <div className="container page"><EmptyState emoji="🤷" title="Not found"><Link to={`/s/${section.key}`}>Back</Link></EmptyState></div>
  if (isEdit && state === 'forbidden')
    return <div className="container page"><EmptyState emoji="🔒" title="You can only edit your own posts"><Link to={`/s/${section.key}/${id}`}>Back</Link></EmptyState></div>
  if (!ready) return <div className="container page"><Spinner label="Loading…" /></div>

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function addTag(fieldKey) {
    const t = customTag.trim().toLowerCase()
    if (t && !form[fieldKey].includes(t)) set(fieldKey, [...form[fieldKey], t])
    setCustomTag('')
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    for (const field of section.fields) {
      if (field.required && !String(form[field.key] || '').trim())
        errs[field.key] = `${field.label} is required.`
    }
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      if (isEdit) {
        await updateListing(section.collection, id, section.fields, form)
        showToast('Saved ✅')
        navigate(`/s/${section.key}/${id}`)
      } else {
        const newId = await createListing(section.collection, section.fields, form, {
          uid: user.uid,
          displayName,
        })
        showToast('Posted 🎉')
        navigate(`/s/${section.key}/${newId}`)
      }
    } catch (err) {
      console.error(err)
      showToast('Could not save. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <Link to={`/s/${section.key}`} className="link-btn back-link">← {section.label}</Link>
      <h1>{isEdit ? 'Edit' : section.addCta}</h1>
      <p className="muted">{section.tagline}</p>

      <form onSubmit={submit} className="spot-form card">
        {section.fields.map((field) => (
          <div className="field" key={field.key}>
            <label htmlFor={field.key}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={field.key}
                value={form[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <div className="chip-row">
                {section.categories.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    className={`chip ${form[field.key] === c.value ? 'is-active' : ''}`}
                    onClick={() => set(field.key, c.value)}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            ) : field.type === 'tags' ? (
              <>
                <div className="chip-row">
                  {Array.from(new Set([...(field.suggestions || []), ...form[field.key]])).map((t) => (
                    <button
                      type="button"
                      key={t}
                      className={`chip ${form[field.key].includes(t) ? 'is-active' : ''}`}
                      onClick={() =>
                        set(
                          field.key,
                          form[field.key].includes(t)
                            ? form[field.key].filter((x) => x !== t)
                            : [...form[field.key], t]
                        )
                      }
                    >
                      #{t}
                    </button>
                  ))}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(field.key)
                      }
                    }}
                    placeholder="Add your own tag…"
                  />
                  <button type="button" className="btn btn-ghost" onClick={() => addTag(field.key)}>
                    Add
                  </button>
                </div>
              </>
            ) : (
              <input
                id={field.key}
                type={field.type === 'url' ? 'url' : 'text'}
                value={form[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.hint && <p className="hint">{field.hint}</p>}
            {errors[field.key] && <p className="hint error">{errors[field.key]}</p>}
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Saving…' : isEdit ? 'Save changes' : section.addCta}
        </button>
      </form>
    </div>
  )
}
