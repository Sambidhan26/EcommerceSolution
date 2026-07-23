export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stockQuantity?: number
  imageUrl?: string
  isFeatured?: boolean
  categoryId: number
  categoryName?: string
  sku?: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  stockQuantity: number
  imageUrl?: string
  isFeatured: boolean
  categoryId: number
}

export interface UpdateProductRequest {
  name: string
  description?: string
  price: number
  stockQuantity: number
  imageUrl?: string
  isFeatured: boolean
  categoryId: number
}
