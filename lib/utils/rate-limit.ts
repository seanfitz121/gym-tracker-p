/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or Vercel KV for distributed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimit = new Map<string, RateLimitRecord>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimit.entries()) {
    if (now > record.resetAt) {
      rateLimit.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Check if a request should be rate limited
 * @param request - The NextRequest object
 * @param options - Rate limit configuration
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export function checkRateLimit(
  request: NextRequest,
  options: {
    limit: number      // Maximum number of requests
    windowMs: number   // Time window in milliseconds
    identifier?: string // Custom identifier (defaults to IP)
  }
): NextResponse | null {
  const { limit, windowMs, identifier } = options
  
  // Use IP address as identifier (with fallback)
  const ip = identifier || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown'
  
  // Create a unique key for this endpoint + IP combination
  const path = new URL(request.url).pathname
  const key = `${ip}:${path}`
  
  const now = Date.now()
  const record = rateLimit.get(key)
  
  // No record exists or window has expired - create new record
  if (!record || now > record.resetAt) {
    rateLimit.set(key, { 
      count: 1, 
      resetAt: now + windowMs 
    })
    return null
  }
  
  // Rate limit exceeded
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': record.resetAt.toString(),
        }
      }
    )
  }
  
  // Increment counter
  record.count++
  
  return null
}

/**
 * Helper function to create a rate limit checker for specific limits
 */
export function createRateLimiter(limit: number, windowMs: number) {
  return (request: NextRequest, identifier?: string) => 
    checkRateLimit(request, { limit, windowMs, identifier })
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Strict limit for authentication endpoints
  auth: createRateLimiter(5, 5 * 60 * 1000), // 5 requests per 5 minutes
  
  // Standard limit for data modifications
  mutation: createRateLimiter(30, 60 * 1000), // 30 requests per minute
  
  // Lenient limit for read operations
  query: createRateLimiter(100, 60 * 1000), // 100 requests per minute
  
  // Strict limit for file uploads
  upload: createRateLimiter(5, 60 * 60 * 1000), // 5 requests per hour
  
  // Moderate limit for search/social features
  social: createRateLimiter(20, 60 * 1000), // 20 requests per minute
}

