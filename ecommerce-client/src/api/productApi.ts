import type { CreateProductRequest, PagedResult, Product, UpdateProductRequest } from '../types'
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

function requireProduct(value: unknown): Product {
  if (!isProduct(value)) {
    throw new Error('The server returned an invalid product.')
  }

  return value
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
  async getAll(): Promise<Product[]> {
    const response = await axiosClient.get<unknown>('/api/product')
    const data = unwrapData(response.data)
    return normalizeProducts(data)
  },

  async getFiltered(query: ProductQuery = {}): Promise<PagedResult<Product>> {
    const response = await axiosClient.get<unknown>('/api/product/filter', {
      params: query,
    })
    const data = unwrapData(response.data)

    return normalizePagedResult(
      data,
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
    const data = unwrapData(response.data)
    return normalizeProducts(data)
  },

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const response = await axiosClient.post<unknown>('/api/product', request)
    return requireProduct(unwrapData(response.data))
  },

  async updateProduct(id: number, request: UpdateProductRequest): Promise<Product> {
    const response = await axiosClient.put<unknown>(`/api/product/${id}`, request)
    const data = response.data === undefined || response.data === null || response.data === ''
      ? null
      : unwrapData(response.data)

    if (isProduct(data)) return data

    const refreshed = await productApi.getById(id)
    if (!refreshed) {
      throw new Error('Product was updated, but the updated product could not be loaded.')
    }

    return refreshed
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await axiosClient.delete<unknown>(`/api/product/${id}`)
    unwrapData(response.data)
  },

  async uploadImage(id: number, file: File): Promise<Product> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post<unknown>(
      `/api/product/${id}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    const data = response.data === undefined || response.data === null || response.data === ''
      ? null
      : unwrapData(response.data)

    if (isProduct(data)) return data

    const refreshed = await productApi.getById(id)
    if (!refreshed) {
      throw new Error('The image was uploaded, but the updated product could not be loaded.')
    }

    return refreshed
  },
}
