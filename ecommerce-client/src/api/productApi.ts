import type { ApiResponse, PagedResult, Product } from '../types'
import { axiosClient } from './axiosClient'

export interface ProductQuery {
  pageNumber?: number
  pageSize?: number
  categoryId?: number
  searchTerm?: string
  sortBy?: string
  sortDescending?: boolean
}

export const productApi = {
  async getFiltered(query: ProductQuery = {}) {
    const response = await axiosClient.get<ApiResponse<PagedResult<Product>>>('/api/product/filter', {
      params: query,
    })
    return response.data
  },
  async getById(id: number) {
    const response = await axiosClient.get<ApiResponse<Product>>(`/api/product/${id}`)
    return response.data
  },
  async getFeatured() {
    const response = await axiosClient.get<ApiResponse<Product[]>>('/api/product/featured')
    return response.data
  },
}
