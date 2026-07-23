import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { hasRole } from '../utils/roles'

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasRole(user?.role, 'Admin')) return <Navigate to="/products" replace />

  return <Outlet />
}
