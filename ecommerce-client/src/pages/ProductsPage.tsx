import { useEffect, useState } from 'react'
import { productApi } from '../api/productApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import type { Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    productApi.getAll()
      .then((response) => { if (isActive) setProducts(response.data.items) })
      .catch(() => { if (isActive) setError('Unable to load products.') })
      .finally(() => { if (isActive) setIsLoading(false) })
    return () => { isActive = false }
  }, [])

  return (
    <section className="page">
      <h1>Products</h1>
      {isLoading && <LoadingMessage />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && products.length === 0 && <p className="muted">No products found.</p>}
      <ul className="card-grid">
        {products.map((product) => (
          <li className="card" key={product.id}>
            <h2>{product.name}</h2>
            {product.description && <p>{product.description}</p>}
            <strong>{formatCurrency(product.price)}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
