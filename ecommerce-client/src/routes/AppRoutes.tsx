import { Route, Routes } from 'react-router-dom'
import { AdminRoute } from '../components/AdminRoute'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminProductFormPage } from '../pages/admin/AdminProductFormPage'
import { AdminProductsPage } from '../pages/admin/AdminProductsPage'
import { CartPage } from '../pages/CartPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OrderDetailsPage } from '../pages/OrderDetailsPage'
import { OrdersPage } from '../pages/OrdersPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { ProductListPage } from '../pages/ProductListPage'
import { RegisterPage } from '../pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/categories" element={<AdminCategoriesPage />} />
          <Route path="admin/products" element={<AdminProductsPage />} />
          <Route path="admin/products/new" element={<AdminProductFormPage />} />
          <Route path="admin/products/:id/edit" element={<AdminProductFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
