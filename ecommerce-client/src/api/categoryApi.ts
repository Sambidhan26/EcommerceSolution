import type { Category } from '../types'
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
}
