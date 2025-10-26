'use client'

import Image from 'next/image'
import { useTheme } from '@/lib/hooks/use-theme'

interface ThemeLogoProps {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ThemeLogo({ 
  width = 160, 
  height = 40, 
  className = "h-10 w-auto",
  priority = false 
}: ThemeLogoProps) {
  const { resolvedTheme } = useTheme()
  
  // Use platep3.png for light mode, platep2.png for dark mode
  const logoSrc = resolvedTheme === 'light' ? '/platep3.png' : '/platep2.png'
  
  return (
    <Image
      src={logoSrc}
      alt="Plate Progress"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}


