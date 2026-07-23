import type { Cart, CartItem } from '../types'
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
  if (!payload.success) throw new Error(payload.message || 'The cart request failed.')
  return payload.data
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null

  const id = readNumber(value.id, -1)
  const productId = readNumber(value.productId, -1)

  if (id < 1 || productId < 1) return null

  const unitPrice = readNumber(value.unitPrice)
  const quantity = Math.max(1, Math.trunc(readNumber(value.quantity, 1)))
  const providedSubTotal = readNumber(value.subTotal, Number.NaN)

  return {
    id,
    productId,
    productName: typeof value.productName === 'string' && value.productName.trim()
      ? value.productName
      : 'Product',
    unitPrice,
    quantity,
    subTotal: Number.isFinite(providedSubTotal) ? providedSubTotal : unitPrice * quantity,
    ...(typeof value.imageUrl === 'string' && value.imageUrl
      ? { imageUrl: value.imageUrl }
      : {}),
  }
}

function normalizeCart(value: unknown): Cart {
  if (!isRecord(value)) {
    return { id: 0, items: [], totalPrice: 0, totalItems: 0 }
  }

  const items = Array.isArray(value.items)
    ? value.items
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item !== null)
    : []
  const calculatedTotalPrice = items.reduce((total, item) => total + item.subTotal, 0)
  const calculatedTotalItems = items.reduce((total, item) => total + item.quantity, 0)

  return {
    id: readNumber(value.id),
    items,
    totalPrice: readNumber(value.totalPrice, calculatedTotalPrice),
    totalItems: readNumber(value.totalItems, calculatedTotalItems),
  }
}

async function readCartResponse(request: Promise<{ data: unknown }>): Promise<Cart> {
  const response = await request
  return normalizeCart(unwrapData(response.data))
}

export const cartApi = {
  getCart(): Promise<Cart> {
    return readCartResponse(axiosClient.get<unknown>('/api/cart'))
  },

  addItem(productId: number, quantity: number): Promise<Cart> {
    return readCartResponse(axiosClient.post<unknown>('/api/cart', { productId, quantity }))
  },

  updateItem(cartItemId: number, quantity: number): Promise<Cart> {
    return readCartResponse(
      axiosClient.put<unknown>(`/api/cart/items/${cartItemId}`, { quantity }),
    )
  },

  removeItem(cartItemId: number): Promise<Cart> {
    return readCartResponse(axiosClient.delete<unknown>(`/api/cart/items/${cartItemId}`))
  },

  clearCart(): Promise<Cart> {
    return readCartResponse(axiosClient.delete<unknown>('/api/cart'))
  },
}
