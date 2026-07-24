import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cartApi } from '../api/cartApi'
import type { AuthUser, Cart } from '../types'
import { CartContext } from './CartContext'
import { useAuth } from './useAuth'

interface CartProviderProps {
  children: ReactNode
}

interface CartCountState {
  owner: AuthUser | null
  count: number
}

function sanitizeCartCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0
}

function getCartCount(cart: Cart): number {
  const totalItems = sanitizeCartCount(cart.totalItems)
  if (totalItems > 0) return totalItems

  const items = Array.isArray(cart.items) ? cart.items : []
  return sanitizeCartCount(
    items.reduce(
      (total, item) => total + sanitizeCartCount(item?.quantity),
      0,
    ),
  )
}

async function loadCartCount(): Promise<number> {
  return getCartCount(await cartApi.getCart())
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, user } = useAuth()
  const [countState, setCountState] = useState<CartCountState>({
    owner: null,
    count: 0,
  })
  const latestRequest = useRef(0)
  const currentUser = useRef(user)

  const setCartCount = useCallback((count: number) => {
    if (!isAuthenticated || !user || currentUser.current !== user) return

    latestRequest.current += 1
    setCountState({
      owner: user,
      count: sanitizeCartCount(count),
    })
  }, [isAuthenticated, user])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user || currentUser.current !== user) return

    const requestId = latestRequest.current + 1
    latestRequest.current = requestId

    try {
      const count = await loadCartCount()

      if (
        latestRequest.current === requestId
        && currentUser.current === user
      ) {
        setCountState({ owner: user, count })
      }
    } catch {
      // Keep the last known count when a background refresh fails.
    }
  }, [isAuthenticated, user])

  useLayoutEffect(() => {
    currentUser.current = user
  }, [user])

  useEffect(() => {
    const requestId = latestRequest.current + 1
    latestRequest.current = requestId

    if (isAuthenticated && user) {
      void loadCartCount()
        .then((count) => {
          if (
            latestRequest.current === requestId
            && currentUser.current === user
          ) {
            setCountState({ owner: user, count })
          }
        })
        .catch(() => {
          // A missing badge is safer than surfacing a background load error.
        })
    }

    return () => {
      latestRequest.current += 1
    }
  }, [isAuthenticated, user])

  const cartCount = isAuthenticated && countState.owner === user
    ? sanitizeCartCount(countState.count)
    : 0
  const value = useMemo(() => ({
    cartCount,
    refreshCart,
    setCartCount,
  }), [cartCount, refreshCart, setCartCount])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
