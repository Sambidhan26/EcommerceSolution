import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../api/productApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { ProductCard } from '../components/ProductCard'
import type { Product } from '../types'

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    productApi.getFeatured()
      .then((featuredProducts) => {
        if (isActive) setProducts(featuredProducts)
      })
      .catch(() => {
        if (isActive) setError('Unable to load featured products.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const featuredProducts = Array.isArray(products) ? products : []

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Simple shopping, thoughtfully curated</p>
          <h1>Find your next favorite thing.</h1>
          <p>Explore a focused collection of products for everyday life.</p>
          <Link className="primary-link" to="/products">Browse all products</Link>
        </div>
      </section>

      <section className="page featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Handpicked</p>
            <h2>Featured products</h2>
          </div>
          <Link className="text-link" to="/products">View all</Link>
        </div>

        {isLoading && <LoadingMessage />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && featuredProducts.length === 0 && (
          <div className="empty-state">
            <h3>No featured products yet</h3>
            <p className="muted">Check back soon or explore the full catalog.</p>
          </div>
        )}
        {!isLoading && !error && featuredProducts.length > 0 && (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
