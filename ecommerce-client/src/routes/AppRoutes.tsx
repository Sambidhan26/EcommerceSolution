import { Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { CategoriesPage } from '../pages/CategoriesPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { ProductListPage } from '../pages/ProductListPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
