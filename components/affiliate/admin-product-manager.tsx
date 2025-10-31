'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Upload, BarChart3, X, Star } from 'lucide-react'
import type { AffiliateProduct, AffiliatePartner, ProductAnalytics } from '@/lib/types/affiliate'

export function AdminProductManager() {
  const [products, setProducts] = useState<AffiliateProduct[]>([])
  const [partners, setPartners] = useState<AffiliatePartner[]>([])
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    fetchProducts()
    fetchPartners()
    fetchAnalytics()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/affiliate/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPartners = async () => {
    try {
      // For now, partners might need to be managed separately
      // This is a placeholder - you may want to create a separate partners API
      const response = await fetch('/api/admin/affiliate/products')
      if (response.ok) {
        const data = await response.json()
        const uniquePartners = new Map<string, AffiliatePartner>()
        data.products?.forEach((p: AffiliateProduct) => {
          if (p.partner) {
            uniquePartners.set(p.partner.id, p.partner)
          }
        })
        setPartners(Array.from(uniquePartners.values()))
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/affiliate/analytics?type=products')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalytics(data.analytics || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/affiliate/products/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete product')
      fetchProducts()
      fetchAnalytics()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleSave = async (productData: any) => {
    try {
      const url = editingProduct 
        ? `/api/admin/affiliate/products/${editingProduct.id}`
        : '/api/admin/affiliate/products'
      
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save product')
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      fetchProducts()
      if (activeTab === 'analytics') {
        fetchAnalytics()
      }
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert(error.message || 'Failed to save product')
    }
  }

  const handleCSVImport = async (file: File) => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/affiliate/products/import', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import CSV')
      }

      const data = await response.json()
      alert(data.message)
      fetchProducts()
    } catch (error: any) {
      console.error('Error importing CSV:', error)
      alert(error.message || 'Failed to import CSV')
    }
  }

  const productStats = analytics.find(a => a.product_id === editingProduct?.id)

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Product Management</h1>
          <p className="text-muted-foreground">Manage affiliate products and view analytics</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              partners={partners}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingProduct(null)
              }}
              stats={productStats}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                      {!product.active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.title} className="w-full h-32 object-cover rounded" />
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.subtitle}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.origin}</Badge>
                      {product.price_hint && (
                        <span className="text-sm font-semibold">{product.price_hint}</span>
                      )}
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            {analytics.map(stat => (
              <Card key={stat.product_id}>
                <CardHeader>
                  <CardTitle>{stat.product_title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Clicks</p>
                      <p className="text-2xl font-bold">{stat.total_clicks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unique Users</p>
                      <p className="text-2xl font-bold">{stat.unique_users}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last 7 Days</p>
                      <p className="text-2xl font-bold">{stat.clicks_last_7_days}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last 30 Days</p>
                      <p className="text-2xl font-bold">{stat.clicks_last_30_days}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  CSV format: title, subtitle, image_url, price_hint, origin, partner_id, affiliate_url, tags, active, rating, description, shipping_note
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCSVImport(file)
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Product Form Component
function ProductForm({ 
  product, 
  partners, 
  onSave, 
  onCancel,
  stats 
}: { 
  product: AffiliateProduct | null
  partners: AffiliatePartner[]
  onSave: (data: any) => void
  onCancel: () => void
  stats?: ProductAnalytics
}) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    subtitle: product?.subtitle || '',
    image_url: product?.image_url || '',
    price_hint: product?.price_hint || '',
    origin: product?.origin || '',
    partner_id: product?.partner_id || '',
    affiliate_url: product?.affiliate_url || '',
    tags: product?.tags?.join(', ') || '',
    active: product?.active ?? true,
    rating: product?.rating?.toString() || '',
    description: product?.description || '',
    shipping_note: product?.shipping_note || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    onSave({
      ...formData,
      tags,
      rating: formData.rating ? parseFloat(formData.rating) : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {stats && (
        <Alert>
          <AlertDescription>
            <strong>Analytics:</strong> {stats.total_clicks} clicks, {stats.unique_users} unique users
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="origin">Origin *</Label>
          <Input
            id="origin"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="affiliate_url">Affiliate URL *</Label>
        <Input
          id="affiliate_url"
          type="url"
          value={formData.affiliate_url}
          onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="price_hint">Price Hint</Label>
          <Input
            id="price_hint"
            value={formData.price_hint}
            onChange={(e) => setFormData({ ...formData, price_hint: e.target.value })}
            placeholder="e.g., From €29.99"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partner_id">Partner</Label>
          <Select 
            value={formData.partner_id || "none"} 
            onValueChange={(value) => setFormData({ ...formData, partner_id: value === "none" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {partners.map(partner => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., supplement, protein, shaker"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="shipping_note">Shipping Note</Label>
        <Input
          id="shipping_note"
          value={formData.shipping_note}
          onChange={(e) => setFormData({ ...formData, shipping_note: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="active">Active (visible in shop)</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>
  )
}

