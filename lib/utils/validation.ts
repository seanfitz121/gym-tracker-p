/**
 * Shared validation functions for user input
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate username format
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }
  
  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'Username must be 3-20 characters' }
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { 
      valid: false, 
      error: 'Username can only contain letters, numbers, hyphens, and underscores' 
    }
  }
  
  return { valid: true }
}

/**
 * Validate email format (basic check)
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true }
}

/**
 * Validate text field with max length
 */
export function validateText(text: string, maxLength: number, fieldName: string = 'Field'): ValidationResult {
  if (text && text.length > maxLength) {
    return { 
      valid: false, 
      error: `${fieldName} must be ${maxLength} characters or less` 
    }
  }
  
  return { valid: true }
}

/**
 * Validate gym code format
 */
export function validateGymCode(code: string): ValidationResult {
  if (!code) {
    return { valid: false, error: 'Gym code is required' }
  }
  
  if (!/^[A-Z0-9]{3,20}$/.test(code)) {
    return { 
      valid: false, 
      error: 'Gym code must be 3-20 uppercase alphanumeric characters' 
    }
  }
  
  return { valid: true }
}

/**
 * Validate file MIME type
 */
export function validateFileType(
  file: File, 
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
    }
  }
  
  return { valid: true }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): ValidationResult {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { 
      valid: false, 
      error: 'Invalid date format. Use YYYY-MM-DD' 
    }
  }
  
  return { valid: true }
}

/**
 * Validate number is within range
 */
export function validateNumber(
  value: number, 
  min: number, 
  max: number, 
  fieldName: string = 'Value'
): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` }
  }
  
  if (value < min || value > max) {
    return { 
      valid: false, 
      error: `${fieldName} must be between ${min} and ${max}` 
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize text input (remove potentially dangerous characters)
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers
}

