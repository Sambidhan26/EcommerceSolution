export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subTotal: number
}

export interface Order {
  id: number
  orderDate: string
  totalAmount: number
  status: string
  items: OrderItem[]
}

// The current checkout endpoint accepts no request fields.
export type CheckoutRequest = Record<string, never>
