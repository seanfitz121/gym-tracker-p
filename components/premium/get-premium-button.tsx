'use client'

import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import Link from 'next/link'

interface GetPremiumButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  children?: React.ReactNode
}

export function GetPremiumButton({ 
  size = 'default', 
  variant = 'default',
  className = '',
  children 
}: GetPremiumButtonProps) {
  return (
    <Button 
      size={size} 
      variant={variant}
      className={`gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 ${className}`}
      asChild
    >
      <Link href="/app/premium">
        <Zap className="h-4 w-4 fill-current" />
        {children || 'Get Premium'}
      </Link>
    </Button>
  )
}

