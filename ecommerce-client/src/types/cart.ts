export interface CartItem {
  id: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  subTotal: number
  imageUrl?: string
}

export interface Cart {
  id: number
  items: CartItem[]
  totalPrice: number
  totalItems: number
}
