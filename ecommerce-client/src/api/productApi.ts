import type { PagedResult, Product } from '../types'
import { axiosClient } from './axiosClient'

export interface ProductQuery {
  pageNumber?: number
  pageSize?: number
  categoryId?: number
  searchTerm?: string
  sortBy?: string
  sortDescending?: boolean
}

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
  if (!payload.success) throw new Error(payload.message || 'The product request failed.')
  return payload.data
}

function isProduct(value: unknown): value is Product {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.name === 'string'
    && typeof value.price === 'number'
}

function normalizeProducts(value: unknown): Product[] {
  return Array.isArray(value) ? value.filter(isProduct) : []
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizePagedResult(
  value: unknown,
  fallbackPageNumber: number,
  fallbackPageSize: number,
): PagedResult<Product> {
  if (!isRecord(value)) {
    return {
      items: [],
      pageNumber: fallbackPageNumber,
      pageSize: fallbackPageSize,
      totalCount: 0,
      totalPages: 0,
    }
  }

  const items = normalizeProducts(value.items)

  return {
    items,
    pageNumber: readNumber(value.pageNumber, fallbackPageNumber),
    pageSize: readNumber(value.pageSize, fallbackPageSize),
    totalCount: readNumber(value.totalCount, items.length),
    totalPages: readNumber(value.totalPages, items.length > 0 ? 1 : 0),
  }
}

export const productApi = {
  async getFiltered(query: ProductQuery = {}): Promise<PagedResult<Product>> {
    const response = await axiosClient.get<unknown>('/api/product/filter', { params: query })
    return normalizePagedResult(
      unwrapData(response.data),
      query.pageNumber ?? 1,
      query.pageSize ?? 8,
    )
  },

  async getById(id: number): Promise<Product | null> {
    const response = await axiosClient.get<unknown>(`/api/product/${id}`)
    const data = unwrapData(response.data)
    return isProduct(data) ? data : null
  },

  async getFeatured(): Promise<Product[]> {
    const response = await axiosClient.get<unknown>('/api/product/featured')
    return normalizeProducts(unwrapData(response.data))
  },
}
