'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ExternalLink, Tag } from 'lucide-react'
import type { AffiliateProduct } from '@/lib/types/affiliate'

interface ProductCardProps {
  product: AffiliateProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `/api/affiliate/out?productId=${product.id}&pid=${product.partner_id || ''}`
    window.open(url, '_blank', 'noopener,noreferrer,nofollow')
  }

  return (
    <Card className="group flex flex-col h-full hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Product Image */}
      {product.image_url && !imageError ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <Tag className="h-12 w-12 text-gray-400" />
        </div>
      )}

      <CardHeader className="flex-1 flex flex-col">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-lg font-semibold line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Subtitle */}
          {product.subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {product.subtitle}
            </p>
          )}

          {/* Meta Row: Origin + Partner Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {product.origin}
            </Badge>
            {product.partner && (
              <Badge variant="secondary" className="text-xs">
                via {product.partner.name}
              </Badge>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Price */}
          {product.price_hint && (
            <p className="text-lg font-bold text-primary">
              {product.price_hint}
            </p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{product.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardFooter className="pt-0">
        <Button
          onClick={handleClick}
          className="w-full group/btn"
          size="lg"
        >
          View on {product.origin}
          <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}

