import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { orderApi } from '../api/orderApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { useCart } from '../context/useCart'
import type { Cart } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { getApiError } from '../utils/getApiError'

const EMPTY_CART: Cart = {
  id: 0,
  items: [],
  totalPrice: 0,
  totalItems: 0,
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { setCartCount } = useCart()
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    cartApi.getCart()
      .then((cartResult) => {
        if (isActive) setCart(cartResult)
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getApiError(
            requestError,
            'Unable to load your cart for checkout. Please try again.',
          ))
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
  const calculatedItemCount = items.reduce((total, item) => total + (item.quantity || 0), 0)
  const totalItems = cart.totalItems || calculatedItemCount
  const calculatedTotal = items.reduce((total, item) => total + (item.subTotal || 0), 0)
  const totalPrice = cart.totalPrice || calculatedTotal

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || items.length === 0) return

    setIsSubmitting(true)
    setError('')

    try {
      const order = await orderApi.checkout({})
      setCartCount(0)

      if (order?.id && Number.isInteger(order.id) && order.id > 0) {
        navigate(`/orders/${order.id}`, { replace: true })
      } else {
        navigate('/orders', { replace: true })
      }
    } catch (requestError) {
      setError(getApiError(
        requestError,
        'Unable to complete checkout. Please review your cart and try again.',
      ))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page checkout-page">
      <Link className="back-link" to="/cart">Back to cart</Link>

      <div className="page-heading checkout-page__heading">
        <div>
          <p className="eyebrow">Final review</p>
          <h1>Checkout</h1>
          <p className="muted">Confirm your cart before placing the order.</p>
        </div>
      </div>

      {isLoading && <LoadingMessage />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && items.length === 0 && (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p className="muted">Add a product before starting checkout.</p>
          <Link className="primary-link" to="/products">Browse products</Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <form
          className="checkout-form"
          aria-busy={isSubmitting}
          onSubmit={(event) => { void handleCheckout(event) }}
        >
          <div className="checkout-layout">
            <section className="checkout-review" aria-labelledby="checkout-items-heading">
              <div className="checkout-review__heading">
                <div>
                  <p className="eyebrow">Your cart</p>
                  <h2 id="checkout-items-heading">Order items</h2>
                </div>
                <span className="muted">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="checkout-items">
                {items.map((item) => {
                  const lineTotal = Number.isFinite(item.subTotal)
                    ? item.subTotal
                    : (item.unitPrice || 0) * (item.quantity || 0)

                  return (
                    <article className="checkout-item" key={item.id}>
                      <div className="checkout-item__details">
                        <h3>{item.productName || 'Product'}</h3>
                        <p className="muted">
                          {item.quantity || 0} × {formatCurrency(item.unitPrice || 0)}
                        </p>
                      </div>
                      <strong>{formatCurrency(lineTotal || 0)}</strong>
                    </article>
                  )
                })}
              </div>

              <div className="checkout-note">
                <strong>Ready to place your order?</strong>
                <p className="muted">
                  The current checkout uses the items and prices shown above.
                </p>
              </div>
            </section>

            <aside className="cart-summary checkout-summary">
              <h2>Order summary</h2>
              <div className="cart-summary__row">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="cart-summary__row cart-summary__total">
                <span>Total</span>
                <strong>{formatCurrency(totalPrice || 0)}</strong>
              </div>
              <p className="muted">
                Placing the order will clear these items from your cart.
              </p>
              <button
                className="button button--primary"
                type="submit"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? 'Placing order…' : 'Place order'}
              </button>
            </aside>
          </div>
        </form>
      )}
    </section>
  )
}
