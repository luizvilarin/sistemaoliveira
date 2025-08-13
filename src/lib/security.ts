/**
 * Security utilities for input validation and sanitization
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  name: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
}

// Sanitize input for SQL/database operations
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>'";&\\]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000) // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email)
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  return VALIDATION_PATTERNS.phone.test(phone.replace(/\s/g, ''))
}

// Validate CPF format
export function isValidCPF(cpf: string): boolean {
  return VALIDATION_PATTERNS.cpf.test(cpf)
}

// Validate name format
export function isValidName(name: string): boolean {
  return VALIDATION_PATTERNS.name.test(name)
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  return VALIDATION_PATTERNS.password.test(password)
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(identifier)
    
    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Reset if window has passed
    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Check if limit exceeded
    if (attempt.count >= this.maxAttempts) {
      return false
    }
    
    // Increment count
    attempt.count++
    attempt.lastAttempt = now
    return true
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Session timeout configuration
export const SESSION_CONFIG = {
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000,  // 5 minutes warning
  CHECK_INTERVAL: 60 * 1000,    // Check every minute
} as const

// Audit logging helper
export interface AuditLogEntry {
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export function createAuditLog(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>
): AuditLogEntry {
  return {
    userId,
    action,
    resource,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
  }
}

// Error sanitization for production
export function sanitizeError(error: any): string {
  if (typeof error === 'string') {
    return error.includes('password') || error.includes('token') || error.includes('secret')
      ? 'Authentication error'
      : error
  }
  
  if (error?.message) {
    const message = error.message
    if (message.includes('password') || message.includes('token') || message.includes('secret')) {
      return 'Authentication error'
    }
    return message
  }
  
  return 'An unexpected error occurred'
}