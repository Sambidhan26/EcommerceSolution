import { useEffect, useState, type FormEvent } from 'react'
import { categoryApi } from '../api/categoryApi'
import { productApi } from '../api/productApi'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingMessage } from '../components/LoadingMessage'
import { ProductCard } from '../components/ProductCard'
import type { Category, PagedResult, Product } from '../types'

const PAGE_SIZE = 8

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

const sortParams: Record<SortOption, { sortBy: string; sortDescending: boolean }> = {
  'name-asc': { sortBy: 'name', sortDescending: false },
  'name-desc': { sortBy: 'name', sortDescending: true },
  'price-asc': { sortBy: 'price', sortDescending: false },
  'price-desc': { sortBy: 'price', sortDescending: true },
}

export function ProductListPage() {
  const [result, setResult] = useState<PagedResult<Product> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState<SortOption>('name-asc')
  const [pageNumber, setPageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    let isActive = true

    categoryApi.getAll()
      .then((categoryResults) => {
        if (isActive) setCategories(categoryResults)
      })
      .catch(() => {
        if (isActive) setCategoryError('Categories are unavailable right now.')
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    productApi.getFiltered({
      pageNumber,
      pageSize: PAGE_SIZE,
      categoryId: categoryId ? Number(categoryId) : undefined,
      searchTerm: searchTerm || undefined,
      ...sortParams[sort],
    })
      .then((pagedResult) => {
        if (isActive) setResult(pagedResult)
      })
      .catch(() => {
        if (isActive) {
          setResult(null)
          setError('Unable to load products. Please try again.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [categoryId, pageNumber, searchTerm, sort])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextSearchTerm = searchInput.trim()

    if (nextSearchTerm === searchTerm && pageNumber === 1) return

    setIsLoading(true)
    setError('')
    setPageNumber(1)
    setSearchTerm(nextSearchTerm)
  }

  function beginFilterChange() {
    setIsLoading(true)
    setError('')
    setPageNumber(1)
  }

  function changePage(nextPage: number) {
    setIsLoading(true)
    setError('')
    setPageNumber(nextPage)
  }

  const safeCategories = Array.isArray(categories) ? categories : []
  const products = Array.isArray(result?.items) ? result.items : []
  const totalPages = result?.totalPages ?? 0

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Explore our products</h1>
          <p className="muted">Search, filter, and find exactly what you need.</p>
        </div>
        {result && <p className="result-count">{result.totalCount} products</p>}
      </div>

      <div className="filters" aria-label="Product filters">
        <form className="search-form" onSubmit={handleSearch}>
          <label htmlFor="product-search">Search products</label>
          <div className="search-form__controls">
            <input
              id="product-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name"
            />
            <button type="submit">Search</button>
          </div>
        </form>

        <div className="filter-field">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={categoryId}
            onChange={(event) => {
              beginFilterChange()
              setCategoryId(event.target.value)
            }}
          >
            <option value="">All categories</option>
            {safeCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {categoryError && <span className="field-note">{categoryError}</span>}
        </div>

        <div className="filter-field">
          <label htmlFor="sort-products">Sort by</label>
          <select
            id="sort-products"
            value={sort}
            onChange={(event) => {
              beginFilterChange()
              setSort(event.target.value as SortOption)
            }}
          >
            <option value="name-asc">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        </div>
      </div>

      {isLoading && <LoadingMessage />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && products.length === 0 && (
        <div className="empty-state">
          <h2>No products found</h2>
          <p className="muted">Try changing your search or category filter.</p>
        </div>
      )}
      {!isLoading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {!isLoading && !error && totalPages > 1 && (
        <nav className="pagination" aria-label="Product pages">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => changePage(pageNumber - 1)}
          >
            Previous
          </button>
          <span>Page {result?.pageNumber ?? pageNumber} of {totalPages}</span>
          <button
            type="button"
            disabled={pageNumber >= totalPages}
            onClick={() => changePage(pageNumber + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  )
}
