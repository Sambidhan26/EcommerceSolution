import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { hasRole } from '../utils/roles'

export function Layout() {
  const { isAuthenticated, logout, user } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const isAdmin = hasRole(user?.role, 'Admin')

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__content">
          <NavLink className="brand" to="/">Ecommerce</NavLink>
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink
                  aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
                  className="cart-nav-link"
                  to="/cart"
                >
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </NavLink>
                <NavLink to="/orders">My Orders</NavLink>
                {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                <button className="nav-button" type="button" onClick={() => { void handleLogout() }}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink className="nav-register" to="/register">Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
    </>
  )
}
