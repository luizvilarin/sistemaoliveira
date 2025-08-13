import { useState, useCallback } from 'react'
import { 
  sanitizeInput, 
  isValidEmail, 
  isValidPhone, 
  isValidCPF, 
  isValidName,
  isValidPassword 
} from '@/lib/security'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useInputValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((
    fieldName: string,
    value: string,
    rules: ValidationRule
  ): string | null => {
    // Sanitize input first
    const sanitizedValue = sanitizeInput(value)
    
    if (rules.required && !sanitizedValue.trim()) {
      return 'Este campo é obrigatório'
    }

    if (sanitizedValue && rules.minLength && sanitizedValue.length < rules.minLength) {
      return `Mínimo de ${rules.minLength} caracteres`
    }

    if (sanitizedValue && rules.maxLength && sanitizedValue.length > rules.maxLength) {
      return `Máximo de ${rules.maxLength} caracteres`
    }

    if (sanitizedValue && rules.pattern && !rules.pattern.test(sanitizedValue)) {
      return 'Formato inválido'
    }

    if (sanitizedValue && rules.custom) {
      return rules.custom(sanitizedValue)
    }

    return null
  }, [])

  const validateForm = useCallback((
    formData: Record<string, string>,
    validationRules: Record<string, ValidationRule>
  ): ValidationResult => {
    const newErrors: Record<string, string> = {}

    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const value = formData[fieldName] || ''
      const error = validateField(fieldName, value, rules)
      
      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }, [validateField])

  const validateEmailField = useCallback((email: string): string | null => {
    if (!email.trim()) return 'Email é obrigatório'
    if (!isValidEmail(email)) return 'Email inválido'
    return null
  }, [])

  const validatePhoneField = useCallback((phone: string): string | null => {
    if (!phone.trim()) return 'Telefone é obrigatório'
    if (!isValidPhone(phone)) return 'Telefone inválido'
    return null
  }, [])

  const validateCPFField = useCallback((cpf: string): string | null => {
    if (!cpf.trim()) return 'CPF é obrigatório'
    if (!isValidCPF(cpf)) return 'CPF inválido'
    return null
  }, [])

  const validateNameField = useCallback((name: string): string | null => {
    if (!name.trim()) return 'Nome é obrigatório'
    if (!isValidName(name)) return 'Nome deve conter apenas letras e ter entre 2-50 caracteres'
    return null
  }, [])

  const validatePasswordField = useCallback((password: string): string | null => {
    if (!password) return 'Senha é obrigatória'
    if (!isValidPassword(password)) {
      return 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'
    }
    return null
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateField,
    validateForm,
    validateEmailField,
    validatePhoneField,
    validateCPFField,
    validateNameField,
    validatePasswordField,
    clearErrors,
    clearFieldError,
  }
}