import { createContext } from 'react'

export interface CartContextValue {
  cartCount: number
  refreshCart: () => Promise<void>
  setCartCount: (count: number) => void
}

export const CartContext = createContext<CartContextValue | null>(null)
