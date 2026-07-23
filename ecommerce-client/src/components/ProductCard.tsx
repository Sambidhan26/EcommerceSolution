import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { resolveImageUrl } from '../utils/resolveImageUrl'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const resolvedImageUrl = resolveImageUrl(product.imageUrl)

  return (
    <article className="product-card">
      <Link className="product-card__image-link" to={`/products/${product.id}`}>
        {resolvedImageUrl ? (
          <img className="product-card__image" src={resolvedImageUrl} alt={product.name} />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true">No image</div>
        )}
      </Link>
      <div className="product-card__content">
        {product.categoryName && <p className="product-card__category">{product.categoryName}</p>}
        <h2 className="product-card__title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="product-card__description">
          {product.description || 'No description available.'}
        </p>
        <div className="product-card__footer">
          <strong>{formatCurrency(product.price)}</strong>
          <Link className="text-link" to={`/products/${product.id}`}>View details</Link>
        </div>
      </div>
    </article>
  )
}
