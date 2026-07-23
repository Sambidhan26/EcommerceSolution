import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'
import { axiosClient } from './axiosClient'

interface ApiEnvelope {
  success: boolean
  message?: string
  data?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return isRecord(value) && typeof value.success === 'boolean'
}

function unwrapData(payload: unknown): unknown {
  if (!isApiEnvelope(payload)) return payload
  if (!payload.success) throw new Error(payload.message || 'The category request failed.')
  return payload.data
}

function isCategory(value: unknown): value is Category {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.name === 'string'
}

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const response = await axiosClient.get<unknown>('/api/category')
    const data = unwrapData(response.data)
    return Array.isArray(data) ? data.filter(isCategory) : []
  },

  async getById(id: number): Promise<Category | null> {
    const response = await axiosClient.get<unknown>(`/api/category/${id}`)
    const data = unwrapData(response.data)
    return isCategory(data) ? data : null
  },

  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const response = await axiosClient.post<unknown>('/api/category', request)
    const data = unwrapData(response.data)

    if (!isCategory(data)) {
      throw new Error('The server returned an invalid category.')
    }

    return data
  },

  async updateCategory(id: number, request: UpdateCategoryRequest): Promise<void> {
    const response = await axiosClient.put<unknown>(`/api/category/${id}`, request)
    unwrapData(response.data)
  },

  async deleteCategory(id: number): Promise<void> {
    const response = await axiosClient.delete<unknown>(`/api/category/${id}`)
    unwrapData(response.data)
  },
}
