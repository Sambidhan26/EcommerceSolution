import { Link } from 'react-router-dom'

export function AdminDashboardPage() {
  return (
    <section className="page admin-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Admin dashboard</h1>
          <p className="muted">Manage the catalog shoppers see in the store.</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <Link className="admin-dashboard-card" to="/admin/products">
          <span className="admin-dashboard-card__icon" aria-hidden="true">P</span>
          <div>
            <h2>Manage products</h2>
            <p>Create products, update inventory and pricing, or remove products.</p>
          </div>
          <span className="admin-dashboard-card__arrow" aria-hidden="true">→</span>
        </Link>

        <Link className="admin-dashboard-card" to="/admin/categories">
          <span className="admin-dashboard-card__icon" aria-hidden="true">C</span>
          <div>
            <h2>Manage categories</h2>
            <p>Create, rename, and remove the categories used in the catalog.</p>
          </div>
          <span className="admin-dashboard-card__arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
