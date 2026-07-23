import type { ApiResponse, PagedResult, Product } from '../types'
import { axiosClient } from './axiosClient'

export interface ProductQuery {
  pageNumber?: number
  pageSize?: number
  categoryId?: number
  search?: string
}

export const productApi = {
  async getAll(query: ProductQuery = {}) {
    const response = await axiosClient.get<ApiResponse<PagedResult<Product>>>('/products', { params: query })
    return response.data
  },
  async getById(id: number) {
    const response = await axiosClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },
}
