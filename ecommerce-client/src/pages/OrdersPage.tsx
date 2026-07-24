import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import type { Order } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { formatOrderDate } from '../utils/formatOrderDate'
import { getApiError } from '../utils/getApiError'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    orderApi.getMyOrders()
      .then((ordersResult) => {
        if (isActive) {
          setOrders(Array.isArray(ordersResult) ? ordersResult : [])
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getApiError(
            requestError,
            'Unable to load your orders. Please try again.',
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

  const safeOrders = Array.isArray(orders) ? orders : []

  return (
    <section className="page orders-page">
      <div className="page-heading orders-page__heading">
        <div>
          <p className="eyebrow">Order history</p>
          <h1>My orders</h1>
          <p className="muted">Review your recent purchases and their status.</p>
        </div>
      </div>

      {isLoading && <LoadingMessage />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && safeOrders.length === 0 && (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p className="muted">Your completed checkouts will appear here.</p>
          <Link className="primary-link" to="/products">Browse products</Link>
        </div>
      )}

      {!isLoading && !error && safeOrders.length > 0 && (
        <div className="orders-list" aria-label="Your orders">
          {safeOrders.map((order) => {
            const status = order.status || 'Unknown'
            const items = Array.isArray(order.items) ? order.items : []
            const itemCount = items.reduce(
              (total, item) => total + (item.quantity || 0),
              0,
            )

            return (
              <article className="order-card" key={order.id}>
                <div className="order-card__details">
                  <h2>
                    <Link to={`/orders/${order.id}`}>Order #{order.id}</Link>
                  </h2>
                  <p className="muted">{formatOrderDate(order.orderDate)}</p>
                  <p className="order-card__items">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <span
                  className="status-pill order-status"
                  data-status={status.toLowerCase()}
                >
                  {status}
                </span>

                <div className="order-card__total">
                  <span>Total</span>
                  <strong>{formatCurrency(order.totalAmount || 0)}</strong>
                </div>

                <Link
                  className="button button--secondary order-card__link"
                  to={`/orders/${order.id}`}
                >
                  View details
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
