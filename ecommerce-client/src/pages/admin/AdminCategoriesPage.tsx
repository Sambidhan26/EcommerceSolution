import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { categoryApi } from '../../api/categoryApi'
import { ErrorMessage } from '../../components/ErrorMessage'
import { LoadingMessage } from '../../components/LoadingMessage'
import type { Category } from '../../types'
import { getApiError } from '../../utils/getApiError'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isActive = true

    categoryApi.getAll()
      .then((results) => {
        if (isActive) setCategories(results)
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getApiError(requestError, 'Unable to load categories.'))
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const safeCategories = Array.isArray(categories) ? categories : []
  const isBusy = isCreating || pendingId !== null

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()

    if (!name) {
      setError('Category name is required.')
      return
    }

    setIsCreating(true)
    setError('')
    setSuccess('')

    try {
      const created = await categoryApi.createCategory({ name })
      setCategories((current) => [...current, created].sort((a, b) => (
        a.name.localeCompare(b.name)
      )))
      setNewName('')
      setSuccess(`Category “${created.name}” was created.`)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to create the category.'))
    } finally {
      setIsCreating(false)
    }
  }

  function beginEditing(category: Category) {
    setEditingId(category.id)
    setEditingName(category.name)
    setError('')
    setSuccess('')
  }

  async function updateCategory(event: FormEvent<HTMLFormElement>, category: Category) {
    event.preventDefault()
    const name = editingName.trim()

    if (!name) {
      setError('Category name is required.')
      return
    }

    setPendingId(category.id)
    setError('')
    setSuccess('')

    try {
      await categoryApi.updateCategory(category.id, { name })
      setCategories((current) => current
        .map((item) => item.id === category.id ? { ...item, name } : item)
        .sort((a, b) => a.name.localeCompare(b.name)))
      setEditingId(null)
      setEditingName('')
      setSuccess(`Category “${name}” was updated.`)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to update the category.'))
    } finally {
      setPendingId(null)
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete the category “${category.name}”?`)) return

    setPendingId(category.id)
    setError('')
    setSuccess('')

    try {
      await categoryApi.deleteCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      if (editingId === category.id) setEditingId(null)
      setSuccess(`Category “${category.name}” was deleted.`)
    } catch (requestError) {
      setError(getApiError(
        requestError,
        'Unable to delete the category. Products may still be using it.',
      ))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="page admin-page">
      <Link className="back-link" to="/admin">← Back to dashboard</Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Catalog setup</p>
          <h1>Manage categories</h1>
          <p className="muted">Create or rename the categories available to products.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <p className="success" role="status">{success}</p>}

      <form className="admin-inline-form" onSubmit={(event) => { void createCategory(event) }}>
        <div className="admin-field">
          <label htmlFor="new-category-name">Category name</label>
          <input
            id="new-category-name"
            type="text"
            required
            maxLength={100}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="For example, Electronics"
          />
        </div>
        <button className="button button--primary" type="submit" disabled={isBusy}>
          {isCreating ? 'Creating…' : 'Create category'}
        </button>
      </form>

      {isLoading && <LoadingMessage />}
      {!isLoading && !error && safeCategories.length === 0 && (
        <div className="empty-state">
          <h2>No categories yet</h2>
          <p className="muted">Create the first category using the form above.</p>
        </div>
      )}
      {!isLoading && safeCategories.length > 0 && (
        <div className="admin-list">
          {safeCategories.map((category) => (
            <article className="admin-list-item" key={category.id}>
              {editingId === category.id ? (
                <form
                  className="admin-edit-row"
                  onSubmit={(event) => { void updateCategory(event, category) }}
                >
                  <div className="admin-field">
                    <label htmlFor={`category-${category.id}`}>Category name</label>
                    <input
                      id={`category-${category.id}`}
                      type="text"
                      required
                      maxLength={100}
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                  </div>
                  <div className="admin-actions">
                    <button
                      className="button button--primary"
                      type="submit"
                      disabled={isBusy}
                    >
                      {pendingId === category.id ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      className="button button--secondary"
                      type="button"
                      disabled={isBusy}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h2>{category.name}</h2>
                    <p className="muted">Category ID: {category.id}</p>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="button button--secondary"
                      type="button"
                      disabled={isBusy}
                      onClick={() => beginEditing(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button--danger"
                      type="button"
                      disabled={isBusy}
                      onClick={() => { void deleteCategory(category) }}
                    >
                      {pendingId === category.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
