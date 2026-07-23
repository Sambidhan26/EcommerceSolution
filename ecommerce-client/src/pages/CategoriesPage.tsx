import { useEffect, useState } from 'react'
import { categoryApi } from '../api/categoryApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import type { Category } from '../types'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    categoryApi.getAll()
      .then((response) => { if (isActive) setCategories(response.data) })
      .catch(() => { if (isActive) setError('Unable to load categories.') })
      .finally(() => { if (isActive) setIsLoading(false) })
    return () => { isActive = false }
  }, [])

  return (
    <section className="page">
      <h1>Categories</h1>
      {isLoading && <LoadingMessage />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && categories.length === 0 && <p className="muted">No categories found.</p>}
      <ul className="card-grid">
        {categories.map((category) => (
          <li className="card" key={category.id}>
            <h2>{category.name}</h2>
            {category.description && <p>{category.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
