'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Filter, X, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AffiliateProduct } from '@/lib/types/affiliate'

interface ShopPageProps {
  userId?: string
}

export function ShopPage({ userId }: ShopPageProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Available filters
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy,
        sortOrder
      })

      if (searchQuery) {
        params.set('search', searchQuery)
      }

      if (selectedOrigin !== 'all') {
        params.set('origin', selectedOrigin)
      }

      if (selectedTags.length > 0) {
        params.set('tags', selectedTags.join(','))
      }

      const response = await fetch(`/api/affiliate/products?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      
      setProducts(data.products || [])
      setPagination(data.pagination)
      setAvailableOrigins(data.filters?.availableOrigins || [])
      
      // Extract all unique tags from products
      const tags = new Set<string>()
      data.products?.forEach((p: AffiliateProduct) => {
        p.tags?.forEach(tag => tags.add(tag))
      })
      setAllTags(Array.from(tags).sort())
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedOrigin, selectedTags, sortBy, sortOrder])

  useEffect(() => {
    fetchProducts(page)
  }, [page, fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts(1)
  }

  const handleOriginChange = (origin: string) => {
    setSelectedOrigin(origin)
    setPage(1)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      setPage(1)
      return newTags
    })
  }

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split(':')
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Disclosure Banner */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          This page contains affiliate links — PlateProgress may earn a commission from purchases made through these links.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Affiliate Shop</h1>
        <p className="text-muted-foreground">
          Discover curated fitness products from our trusted partners
        </p>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Origin Filter */}
          <Select value={selectedOrigin} onValueChange={handleOriginChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Origins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              {availableOrigins.map(origin => (
                <SelectItem key={origin} value={origin}>
                  {origin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={`${sortBy}:${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at:desc">Newest First</SelectItem>
              <SelectItem value="created_at:asc">Oldest First</SelectItem>
              <SelectItem value="rating:desc">Highest Rated</SelectItem>
              <SelectItem value="rating:asc">Lowest Rated</SelectItem>
              <SelectItem value="price:asc">Price: Low to High</SelectItem>
              <SelectItem value="price:desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filters */}
          {(selectedOrigin !== 'all' || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedOrigin !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedOrigin}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleOriginChange('all')}
                  />
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleTag(tag)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedOrigin('all')
                  setSelectedTags([])
                  setPage(1)
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading && page === 1 ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold mb-2">No products found</p>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && (
            <div className="text-center text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
            </div>
          )}
        </>
      )}
    </div>
  )
}

