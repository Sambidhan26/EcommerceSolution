import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { productApi } from '../../api/productApi'
import { ErrorMessage } from '../../components/ErrorMessage'
import { LoadingMessage } from '../../components/LoadingMessage'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/formatCurrency'
import { getApiError } from '../../utils/getApiError'

interface ProductsLocationState {
  successMessage?: string
}

export function AdminProductsPage() {
  const location = useLocation()
  const locationState = location.state as ProductsLocationState | null
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(locationState?.successMessage || '')

  useEffect(() => {
    let isActive = true

    productApi.getAll()
      .then((results) => {
        if (isActive) setProducts(results)
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getApiError(requestError, 'Unable to load products.'))
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const safeProducts = Array.isArray(products) ? products : []

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return

    setDeletingId(product.id)
    setError('')
    setSuccess('')

    try {
      await productApi.deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setSuccess(`Product “${product.name}” was deleted.`)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to delete the product.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page admin-page">
      <Link className="back-link" to="/admin">← Back to dashboard</Link>

      <div className="page-heading admin-page__heading">
        <div>
          <p className="eyebrow">Catalog inventory</p>
          <h1>Manage products</h1>
          <p className="muted">Review products and keep their details up to date.</p>
        </div>
        <Link className="primary-link" to="/admin/products/new">Create product</Link>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <p className="success" role="status">{success}</p>}
      {isLoading && <LoadingMessage />}

      {!isLoading && !error && safeProducts.length === 0 && (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p className="muted">Create the first product to begin building the catalog.</p>
          <Link className="primary-link" to="/admin/products/new">Create product</Link>
        </div>
      )}

      {!isLoading && safeProducts.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Featured</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {safeProducts.map((product) => (
                <tr key={product.id}>
                  <td data-label="Product">
                    <strong>{product.name}</strong>
                    {product.sku && <span className="admin-table__secondary">{product.sku}</span>}
                  </td>
                  <td data-label="Category">{product.categoryName || 'Uncategorized'}</td>
                  <td data-label="Price">{formatCurrency(product.price || 0)}</td>
                  <td data-label="Stock">{product.stockQuantity ?? 0}</td>
                  <td data-label="Featured">
                    <span className={product.isFeatured ? 'status-pill status-pill--yes' : 'status-pill'}>
                      {product.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="admin-table__actions">
                    <Link
                      className="button button--secondary"
                      to={`/admin/products/${product.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="button button--danger"
                      type="button"
                      disabled={deletingId !== null}
                      onClick={() => { void deleteProduct(product) }}
                    >
                      {deletingId === product.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
