import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="page">
      <h1>Welcome to Ecommerce</h1>
      <p className="muted">Browse the latest products in our catalog.</p>
      <Link to="/products">View products</Link>
    </section>
  )
}
