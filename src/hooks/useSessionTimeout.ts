import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SESSION_CONFIG } from '@/lib/security'
import { toast } from 'sonner'

export function useSessionTimeout() {
  const { signOut, user } = useAuth()
  const lastActivity = useRef(Date.now())
  const warningShown = useRef(false)
  const timeoutId = useRef<NodeJS.Timeout>()
  const warningTimeoutId = useRef<NodeJS.Timeout>()

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now()
    warningShown.current = false
    
    // Clear existing timeouts
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    if (warningTimeoutId.current) {
      clearTimeout(warningTimeoutId.current)
    }
    
    // Only set timeouts if user is logged in
    if (!user) return
    
    // Set warning timeout
    warningTimeoutId.current = setTimeout(() => {
      if (!warningShown.current) {
        warningShown.current = true
        toast.warning('Sua sessão expirará em 5 minutos devido à inatividade', {
          duration: 10000,
          action: {
            label: 'Continuar ativo',
            onClick: resetActivity,
          },
        })
      }
    }, SESSION_CONFIG.IDLE_TIMEOUT - SESSION_CONFIG.WARNING_TIME)
    
    // Set logout timeout
    timeoutId.current = setTimeout(() => {
      toast.error('Sessão expirada por inatividade')
      signOut()
    }, SESSION_CONFIG.IDLE_TIMEOUT)
  }, [user, signOut])

  const checkActivity = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivity.current
    
    if (timeSinceLastActivity >= SESSION_CONFIG.IDLE_TIMEOUT) {
      toast.error('Sessão expirada por inatividade')
      signOut()
    } else if (
      timeSinceLastActivity >= SESSION_CONFIG.IDLE_TIMEOUT - SESSION_CONFIG.WARNING_TIME &&
      !warningShown.current
    ) {
      warningShown.current = true
      toast.warning('Sua sessão expirará em breve devido à inatividade', {
        duration: 10000,
        action: {
          label: 'Continuar ativo',
          onClick: resetActivity,
        },
      })
    }
  }, [signOut, resetActivity])

  useEffect(() => {
    if (!user) return

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      resetActivity()
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Set up periodic check
    const checkInterval = setInterval(checkActivity, SESSION_CONFIG.CHECK_INTERVAL)
    
    // Initialize timeouts
    resetActivity()

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      
      // Clear intervals and timeouts
      clearInterval(checkInterval)
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
      if (warningTimeoutId.current) {
        clearTimeout(warningTimeoutId.current)
      }
    }
  }, [user, resetActivity, checkActivity])

  return { resetActivity }
}