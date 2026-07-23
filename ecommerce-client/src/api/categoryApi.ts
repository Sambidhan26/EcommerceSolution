import type { ApiResponse, Category } from '../types'
import { axiosClient } from './axiosClient'

export const categoryApi = {
  async getAll() {
    const response = await axiosClient.get<ApiResponse<Category[]>>('/categories')
    return response.data
  },
  async getById(id: number) {
    const response = await axiosClient.get<ApiResponse<Category>>(`/categories/${id}`)
    return response.data
  },
}
