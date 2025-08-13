import { useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { createAuditLog, type AuditLogEntry } from '@/lib/security'

export function useAuditLog() {
  const { user } = useAuth()

  const logAction = useCallback(async (
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return

    try {
      const auditEntry = createAuditLog(
        user.id,
        action,
        resource,
        resourceId,
        metadata
      )

      // In a production environment, you would send this to a dedicated audit log table
      // For now, we'll use the console and could extend to a proper audit system
      console.log('AUDIT LOG:', auditEntry)

      // Store in local storage for development/debugging
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]')
      existingLogs.push(auditEntry)
      
      // Keep only last 1000 entries
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000)
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(existingLogs))

    } catch (error) {
      console.error('Failed to log audit action:', error)
    }
  }, [user])

  const logSensitiveAccess = useCallback(async (
    resource: string,
    resourceId: string,
    accessType: 'view' | 'edit' | 'delete' | 'create'
  ) => {
    await logAction(`sensitive_${accessType}`, resource, resourceId, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })
  }, [logAction])

  return {
    logAction,
    logSensitiveAccess,
  }
}
