import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import type { Cart } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { getApiError } from '../utils/getApiError'
import { resolveImageUrl } from '../utils/resolveImageUrl'

const EMPTY_CART: Cart = {
  id: 0,
  items: [],
  totalPrice: 0,
  totalItems: 0,
}

export function CartPage() {
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    cartApi.getCart()
      .then((cartResult) => {
        if (isActive) setCart(cartResult)
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getApiError(requestError, 'Unable to load your cart. Please try again.'))
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const items = Array.isArray(cart.items) ? cart.items : []
  const isBusy = pendingItemId !== null || isClearing

  async function updateQuantity(cartItemId: number, quantity: number) {
    const safeQuantity = Math.max(1, Math.trunc(quantity))
    setPendingItemId(cartItemId)
    setError('')

    try {
      setCart(await cartApi.updateItem(cartItemId, safeQuantity))
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to update this item. Please try again.'))
    } finally {
      setPendingItemId(null)
    }
  }

  async function removeItem(cartItemId: number) {
    setPendingItemId(cartItemId)
    setError('')

    try {
      setCart(await cartApi.removeItem(cartItemId))
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to remove this item. Please try again.'))
    } finally {
      setPendingItemId(null)
    }
  }

  async function clearCart() {
    setIsClearing(true)
    setError('')

    try {
      setCart(await cartApi.clearCart())
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to clear your cart. Please try again.'))
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <section className="page cart-page">
      <div className="page-heading cart-page__heading">
        <div>
          <p className="eyebrow">Your selection</p>
          <h1>Shopping cart</h1>
          {!isLoading && items.length > 0 && (
            <p className="muted">
              {cart.totalItems || 0} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>
        {items.length > 0 && (
          <button
            className="button button--danger"
            type="button"
            disabled={isBusy}
            onClick={() => { void clearCart() }}
          >
            {isClearing ? 'Clearing…' : 'Clear cart'}
          </button>
        )}
      </div>

      {isLoading && <LoadingMessage />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && items.length === 0 && (
        <div className="empty-state cart-empty">
          <h2>Your cart is empty</h2>
          <p className="muted">Browse the catalog and add something you love.</p>
          <Link className="primary-link" to="/products">Browse products</Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-items" aria-label="Cart items">
            {items.map((item) => {
              const isPending = pendingItemId === item.id
              const resolvedImageUrl = resolveImageUrl(item.imageUrl)

              return (
                <article className="cart-item" key={item.id}>
                  <Link className="cart-item__media" to={`/products/${item.productId}`}>
                    {resolvedImageUrl ? (
                      <img src={resolvedImageUrl} alt={item.productName} />
                    ) : (
                      <span aria-hidden="true">No image</span>
                    )}
                  </Link>

                  <div className="cart-item__details">
                    <h2>
                      <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                    </h2>
                    <p className="muted">{formatCurrency(item.unitPrice)} each</p>
                    <button
                      className="cart-item__remove"
                      type="button"
                      disabled={isBusy}
                      onClick={() => { void removeItem(item.id) }}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item__quantity">
                    <span className="cart-item__label">Quantity</span>
                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.productName}`}
                        disabled={isBusy || item.quantity <= 1}
                        onClick={() => { void updateQuantity(item.id, item.quantity - 1) }}
                      >
                        −
                      </button>
                      <span aria-live="polite">{isPending ? '…' : item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.productName}`}
                        disabled={isBusy}
                        onClick={() => { void updateQuantity(item.id, item.quantity + 1) }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__total">
                    <span className="cart-item__label">Line total</span>
                    <strong>{formatCurrency(item.subTotal)}</strong>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div className="cart-summary__row">
              <span>Items</span>
              <span>{cart.totalItems || 0}</span>
            </div>
            <div className="cart-summary__row cart-summary__total">
              <span>Subtotal</span>
              <strong>{formatCurrency(cart.totalPrice || 0)}</strong>
            </div>
            <p className="muted">Shipping and taxes are calculated at checkout.</p>
          </aside>
        </div>
      )}
    </section>
  )
}
