import axios from 'axios'
import type { CheckoutRequest, Order, OrderItem } from '../types'
import { axiosClient } from './axiosClient'

interface ApiEnvelope {
  success?: boolean
  message?: unknown
  data?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function unwrapData(payload: unknown, fallbackMessage: string): unknown {
  if (!isRecord(payload)) return payload

  const envelope = payload as ApiEnvelope

  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === 'string' && envelope.message.trim()
        ? envelope.message
        : fallbackMessage,
    )
  }

  if ('data' in payload && (typeof envelope.success === 'boolean' || !('id' in payload))) {
    return envelope.data
  }

  return payload
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value)
    if (Number.isFinite(parsedValue)) return parsedValue
  }

  return fallback
}

function readNonNegativeNumber(value: unknown, fallback = 0): number {
  return Math.max(0, readNumber(value, fallback))
}

function normalizeOrderItem(value: unknown): OrderItem | null {
  if (!isRecord(value)) return null

  const unitPrice = readNonNegativeNumber(value.unitPrice)
  const quantity = Math.max(0, Math.trunc(readNumber(value.quantity)))
  const calculatedSubTotal = unitPrice * quantity

  return {
    productId: Math.max(0, Math.trunc(readNumber(value.productId))),
    productName: typeof value.productName === 'string' && value.productName.trim()
      ? value.productName.trim()
      : 'Product',
    quantity,
    unitPrice,
    subTotal: readNonNegativeNumber(value.subTotal, calculatedSubTotal),
  }
}

function normalizeOrder(value: unknown): Order | null {
  if (!isRecord(value)) return null

  const id = Math.trunc(readNumber(value.id))
  if (id < 1) return null

  const items = Array.isArray(value.items)
    ? value.items
      .map(normalizeOrderItem)
      .filter((item): item is OrderItem => item !== null)
    : []
  const calculatedTotal = items.reduce((total, item) => total + item.subTotal, 0)

  return {
    id,
    orderDate: typeof value.orderDate === 'string' ? value.orderDate : '',
    totalAmount: readNonNegativeNumber(value.totalAmount, calculatedTotal),
    status: typeof value.status === 'string' && value.status.trim()
      ? value.status.trim()
      : 'Unknown',
    items,
  }
}

function normalizeOrders(value: unknown): Order[] {
  if (!Array.isArray(value)) return []

  return value
    .map(normalizeOrder)
    .filter((order): order is Order => order !== null)
}

export const orderApi = {
  async checkout(request: CheckoutRequest): Promise<Order | null> {
    // Keep the request-shaped API while respecting the backend's bodyless endpoint.
    void request
    const response = await axiosClient.post<unknown>('/api/orders/checkout')
    return normalizeOrder(unwrapData(response.data, 'Checkout failed.'))
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await axiosClient.get<unknown>('/api/orders')
    return normalizeOrders(unwrapData(response.data, 'Unable to load your orders.'))
  },

  async getOrderById(orderId: number): Promise<Order | null> {
    if (!Number.isInteger(orderId) || orderId < 1) return null

    try {
      const response = await axiosClient.get<unknown>(`/api/orders/${orderId}`)
      return normalizeOrder(unwrapData(response.data, 'Unable to load this order.'))
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      throw error
    }
  },
}
