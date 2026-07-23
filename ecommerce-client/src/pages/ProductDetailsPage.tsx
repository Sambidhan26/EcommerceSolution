import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { productApi } from '../api/productApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { useAuth } from '../context/useAuth'
import type { Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { getApiError } from '../utils/getApiError'
import { resolveImageUrl } from '../utils/resolveImageUrl'

export function ProductDetailsPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const productId = Number(id)
  const isValidProductId = Number.isInteger(productId) && productId > 0
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(isValidProductId)
  const [error, setError] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartSuccess, setCartSuccess] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    let isActive = true

    if (!isValidProductId) {
      return () => {
        isActive = false
      }
    }

    productApi.getById(productId)
      .then((productResult) => {
        if (isActive) setProduct(productResult ?? null)
      })
      .catch(() => {
        if (isActive) setError('Unable to load this product.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [isValidProductId, productId])

  const resolvedImageUrl = resolveImageUrl(product?.imageUrl)

  async function handleAddToCart() {
    if (!product) return

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }

    setIsAdding(true)
    setCartError('')
    setCartSuccess('')

    try {
      await cartApi.addItem(product.id, 1)
      setCartSuccess(`${product.name} was added to your cart.`)
    } catch (requestError) {
      setCartError(getApiError(
        requestError,
        'Unable to add this product. It may no longer be in stock.',
      ))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section className="page">
      <Link className="back-link" to="/products">← Back to products</Link>

      {isLoading && <LoadingMessage />}
      {!isValidProductId && <ErrorMessage message="This product link is invalid." />}
      {error && <ErrorMessage message={error} />}
      {isValidProductId && !isLoading && !error && product === null && (
        <div className="empty-state">
          <h1>Product not found</h1>
          <p className="muted">This product may no longer be available.</p>
        </div>
      )}
      {!isLoading && !error && product !== null && (
        <article className="product-details">
          <div className="product-details__media">
            {resolvedImageUrl ? (
              <img src={resolvedImageUrl} alt={product.name} />
            ) : (
              <div className="product-card__placeholder" aria-hidden="true">No image</div>
            )}
          </div>
          <div className="product-details__content">
            {product.categoryName && <p className="eyebrow">{product.categoryName}</p>}
            <h1>{product.name}</h1>
            <p className="product-details__price">{formatCurrency(product.price)}</p>
            <p className="product-details__description">
              {product.description || 'No description available.'}
            </p>
            {product.stockQuantity !== undefined && (
              <p className={product.stockQuantity > 0 ? 'stock stock--available' : 'stock'}>
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} available`
                  : 'Currently out of stock'}
              </p>
            )}
            <div className="product-details__cart">
              {cartSuccess && <p className="success" role="status">{cartSuccess}</p>}
              {cartError && <ErrorMessage message={cartError} />}
              <button
                className="button button--primary"
                type="button"
                disabled={isAdding || product.stockQuantity === 0}
                onClick={() => { void handleAddToCart() }}
              >
                {isAdding ? 'Adding…' : 'Add to cart'}
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}
