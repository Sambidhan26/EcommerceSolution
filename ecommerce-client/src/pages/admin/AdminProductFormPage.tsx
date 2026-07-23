import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { categoryApi } from '../../api/categoryApi'
import { productApi } from '../../api/productApi'
import { ErrorMessage } from '../../components/ErrorMessage'
import { LoadingMessage } from '../../components/LoadingMessage'
import type {
  Category,
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '../../types'
import { getApiError } from '../../utils/getApiError'

interface ProductFormState {
  name: string
  description: string
  price: string
  stockQuantity: string
  imageUrl: string
  isFeatured: boolean
  categoryId: string
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '0',
  imageUrl: '',
  isFeatured: false,
  categoryId: '',
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description || '',
    price: String(product.price),
    stockQuantity: String(product.stockQuantity ?? 0),
    imageUrl: product.imageUrl || '',
    isFeatured: product.isFeatured ?? false,
    categoryId: String(product.categoryId),
  }
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = id !== undefined
  const productId = Number(id)
  const isValidProductId = !isEditing || (Number.isInteger(productId) && productId > 0)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadForm() {
      if (!isValidProductId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const categoryResults = await categoryApi.getAll()
        if (!isActive) return

        const safeCategoryResults = Array.isArray(categoryResults) ? categoryResults : []
        setCategories(safeCategoryResults)

        if (!isEditing) {
          if (safeCategoryResults.length > 0) {
            setForm((current) => ({
              ...current,
              categoryId: String(safeCategoryResults[0].id),
            }))
          }
          return
        }

        const productResult = await productApi.getById(productId)
        if (!isActive) return

        if (!productResult) {
          setError('Product not found.')
          return
        }

        setForm(productToForm(productResult))
      } catch (requestError) {
        console.error('Unable to initialize the admin product form.', requestError)
        if (isActive) {
          setError(getApiError(requestError, 'Unable to load the product form.'))
          setCategories([])
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadForm()

    return () => {
      isActive = false
    }
  }, [isEditing, isValidProductId, productId])

  const safeCategories = Array.isArray(categories) ? categories : []
  const showForm = !isLoading
    && isValidProductId
    && (!isEditing || form.name.length > 0)

  function setField<Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function buildRequest(): CreateProductRequest | UpdateProductRequest | null {
    const name = form.name.trim()
    const description = form.description.trim()
    const price = Number(form.price)
    const stockQuantity = Number(form.stockQuantity)
    const categoryId = Number(form.categoryId)

    if (!name) {
      setError('Product name is required.')
      return null
    }

    if (!Number.isFinite(price) || price < 0.01 || price > 1_000_000) {
      setError('Price must be between 0.01 and 1,000,000.')
      return null
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError('Stock quantity must be a whole number of zero or more.')
      return null
    }

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      setError('Select a category.')
      return null
    }

    return {
      name,
      description: description || undefined,
      price,
      stockQuantity,
      imageUrl: form.imageUrl.trim() || undefined,
      isFeatured: form.isFeatured,
      categoryId,
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const request = buildRequest()
    if (!request) return

    setIsSaving(true)

    try {
      let savedProduct = isEditing
        ? await productApi.updateProduct(productId, request)
        : await productApi.createProduct(request)

      if (imageFile) {
        savedProduct = await productApi.uploadImage(savedProduct.id, imageFile)

        if (!savedProduct.imageUrl) {
          const refreshedProduct = await productApi.getById(savedProduct.id)
          if (refreshedProduct) savedProduct = refreshedProduct
        }
      }

      if (!isEditing) {
        navigate('/admin/products', {
          replace: true,
          state: { successMessage: `Product “${savedProduct.name}” was created.` },
        })
        return
      }

      setForm(productToForm(savedProduct))
      setImageFile(null)
      setSuccess(`Product “${savedProduct.name}” was updated.`)
    } catch (requestError) {
      console.error('Unable to save product', requestError)
      setError(getApiError(requestError, 'Unable to save the product.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page admin-page">
      <Link className="back-link" to="/admin/products">← Back to products</Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Catalog inventory</p>
          <h1>{isEditing ? 'Edit product' : 'Create product'}</h1>
          <p className="muted">
            {isEditing
              ? 'Update product details, inventory, and visibility.'
              : 'Add a new product to the storefront catalog.'}
          </p>
        </div>
      </div>

      {isLoading && <LoadingMessage />}
      {!isValidProductId && <ErrorMessage message="This product link is invalid." />}
      {error && <ErrorMessage message={error} />}
      {success && <p className="success" role="status">{success}</p>}

      {showForm && (
        <form className="admin-form" onSubmit={(event) => { void saveProduct(event) }}>
          <div className="admin-form__grid">
            <div className="admin-field admin-field--full">
              <label htmlFor="product-name">Name</label>
              <input
                id="product-name"
                type="text"
                required
                maxLength={150}
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
              />
            </div>

            <div className="admin-field admin-field--full">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                rows={5}
                maxLength={1000}
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-price">Price</label>
              <input
                id="product-price"
                type="number"
                required
                min="0.01"
                max="1000000"
                step="0.01"
                value={form.price}
                onChange={(event) => setField('price', event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-stock">Stock quantity</label>
              <input
                id="product-stock"
                type="number"
                required
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(event) => setField('stockQuantity', event.target.value)}
              />
            </div>

            <div className="admin-field admin-field--full">
              <label htmlFor="product-category">Category</label>
              <select
                id="product-category"
                required
                value={form.categoryId}
                onChange={(event) => setField('categoryId', event.target.value)}
              >
                <option value="">Select a category</option>
                {safeCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {safeCategories.length === 0 && (
                <span className="field-note">
                  Create a category before saving a product.
                </span>
              )}
            </div>

            <div className="admin-field admin-field--full">
              <label htmlFor="product-image-file">Upload image</label>
              <input
                id="product-image-file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              />
              <span className="admin-field__help">
                Optional. A selected file is uploaded after the product is saved.
              </span>
              {imageFile && (
                <span className="admin-field__help">Selected: {imageFile.name}</span>
              )}
            </div>

            <label className="admin-checkbox admin-field--full">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setField('isFeatured', event.target.checked)}
              />
              <span>Feature this product on the storefront</span>
            </label>
          </div>

          <div className="admin-form__actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={isSaving || safeCategories.length === 0}
            >
              {isSaving
                ? 'Saving…'
                : isEditing ? 'Save changes' : 'Create product'}
            </button>
            <Link className="button button--secondary" to="/admin/products">Cancel</Link>
          </div>
        </form>
      )}
    </section>
  )
}
