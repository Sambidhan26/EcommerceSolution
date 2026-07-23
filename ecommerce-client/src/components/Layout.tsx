import { NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="site-header__content">
          <NavLink className="brand" to="/">Ecommerce</NavLink>
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/categories">Categories</NavLink>
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
    </>
  )
}
