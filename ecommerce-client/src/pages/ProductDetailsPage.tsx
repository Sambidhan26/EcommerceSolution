import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productApi } from '../api/productApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import type { Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

export function ProductDetailsPage() {
  const { id } = useParams()
  const productId = Number(id)
  const isValidProductId = Number.isInteger(productId) && productId > 0
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(isValidProductId)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    if (!isValidProductId) return () => { isActive = false }

    productApi.getById(productId)
      .then((response) => { if (isActive) setProduct(response.data) })
      .catch(() => { if (isActive) setError('Unable to load this product.') })
      .finally(() => { if (isActive) setIsLoading(false) })
    return () => { isActive = false }
  }, [isValidProductId, productId])

  return (
    <section className="page">
      <Link className="back-link" to="/products">← Back to products</Link>
      {isLoading && <LoadingMessage />}
      {!isValidProductId && <ErrorMessage message="This product link is invalid." />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && product && (
        <article className="product-details">
          <div className="product-details__media">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
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
                {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Currently out of stock'}
              </p>
            )}
          </div>
        </article>
      )}
    </section>
  )
}
