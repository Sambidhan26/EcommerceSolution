import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import type { Order } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { formatOrderDate } from '../utils/formatOrderDate'
import { getApiError } from '../utils/getApiError'

interface OrderLoadResult {
  orderId: number
  order: Order | null
  error: string
}

export function OrderDetailsPage() {
  const { id } = useParams()
  const hasValidOrderIdFormat = typeof id === 'string' && /^[1-9]\d*$/.test(id)
  const orderId = hasValidOrderIdFormat ? Number(id) : Number.NaN
  const isValidOrderId = hasValidOrderIdFormat && Number.isSafeInteger(orderId)
  const [loadResult, setLoadResult] = useState<OrderLoadResult | null>(null)

  useEffect(() => {
    let isActive = true

    if (!isValidOrderId) {
      return () => {
        isActive = false
      }
    }

    orderApi.getOrderById(orderId)
      .then((orderResult) => {
        if (isActive) {
          setLoadResult({ orderId, order: orderResult, error: '' })
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setLoadResult({
            orderId,
            order: null,
            error: getApiError(
              requestError,
              'Unable to load this order. Please try again.',
            ),
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [isValidOrderId, orderId])

  const hasCurrentResult = isValidOrderId && loadResult?.orderId === orderId
  const isLoading = isValidOrderId && !hasCurrentResult
  const order = hasCurrentResult ? loadResult.order : null
  const error = hasCurrentResult ? loadResult.error : ''
  const items = Array.isArray(order?.items) ? order.items : []
  const status = order?.status || 'Unknown'

  return (
    <section className="page order-details-page">
      <Link className="back-link" to="/orders">Back to My Orders</Link>

      {isLoading && <LoadingMessage />}
      {!isValidOrderId && (
        <ErrorMessage message="This order link is invalid. Please choose an order from My Orders." />
      )}
      {error && <ErrorMessage message={error} />}

      {isValidOrderId && !isLoading && !error && order === null && (
        <div className="empty-state">
          <h1>Order not found</h1>
          <p className="muted">
            This order may not exist or may not belong to your account.
          </p>
          <Link className="primary-link" to="/orders">View My Orders</Link>
        </div>
      )}

      {!isLoading && !error && order !== null && (
        <>
          <div className="page-heading order-details__heading">
            <div>
              <p className="eyebrow">Order details</p>
              <h1>Order #{order.id}</h1>
              <p className="muted">Placed {formatOrderDate(order.orderDate)}</p>
            </div>
            <span
              className="status-pill order-status order-details__status"
              data-status={status.toLowerCase()}
            >
              {status}
            </span>
          </div>

          <section className="order-overview" aria-label="Order summary">
            <div className="order-overview__item">
              <span>Order reference</span>
              <strong>#{order.id}</strong>
            </div>
            <div className="order-overview__item">
              <span>Date</span>
              <strong>{formatOrderDate(order.orderDate)}</strong>
            </div>
            <div className="order-overview__item">
              <span>Total</span>
              <strong>{formatCurrency(order.totalAmount || 0)}</strong>
            </div>
          </section>

          <section className="order-items-panel" aria-labelledby="order-items-heading">
            <div className="order-items-panel__heading">
              <div>
                <p className="eyebrow">Purchase summary</p>
                <h2 id="order-items-heading">Items</h2>
              </div>
              <span className="muted">
                {items.length} {items.length === 1 ? 'line' : 'lines'}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="empty-state order-items-empty">
                <h3>No item details available</h3>
                <p className="muted">This order does not include any item data.</p>
              </div>
            ) : (
              <div className="order-lines">
                {items.map((item, index) => {
                  const lineTotal = Number.isFinite(item.subTotal)
                    ? item.subTotal
                    : (item.unitPrice || 0) * (item.quantity || 0)
                  const productName = item.productName || 'Product'

                  return (
                    <article
                      className="order-line"
                      key={`${item.productId}-${index}`}
                    >
                      <div className="order-line__product">
                        <span>Product</span>
                        {item.productId > 0 ? (
                          <Link to={`/products/${item.productId}`}>{productName}</Link>
                        ) : (
                          <strong>{productName}</strong>
                        )}
                      </div>
                      <div className="order-line__metric">
                        <span>Quantity</span>
                        <strong>{item.quantity || 0}</strong>
                      </div>
                      <div className="order-line__metric">
                        <span>Price</span>
                        <strong>{formatCurrency(item.unitPrice || 0)}</strong>
                      </div>
                      <div className="order-line__metric order-line__total">
                        <span>Line total</span>
                        <strong>{formatCurrency(lineTotal || 0)}</strong>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}
