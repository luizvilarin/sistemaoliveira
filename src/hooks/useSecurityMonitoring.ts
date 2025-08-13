import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface SecurityMonitoringHook {
  reportSuspiciousActivity: (action: string, resource: string, metadata?: Record<string, any>) => Promise<void>
  reportDataAccess: (resource: string, resourceId: string, accessType: 'view' | 'edit' | 'delete') => Promise<void>
  isLoading: boolean
}

export function useSecurityMonitoring(): SecurityMonitoringHook {
  const [isLoading, setIsLoading] = useState(false)

  const reportSuspiciousActivity = useCallback(async (
    action: string,
    resource: string,
    metadata?: Record<string, any>
  ) => {
    setIsLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      await supabase.functions.invoke('security-monitor', {
        body: {
          userId: user.user.id,
          action,
          resource,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...metadata
          }
        }
      })
    } catch (error) {
      console.error('Failed to report suspicious activity:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reportDataAccess = useCallback(async (
    resource: string,
    resourceId: string,
    accessType: 'view' | 'edit' | 'delete'
  ) => {
    await reportSuspiciousActivity(`data_${accessType}`, resource, {
      resourceId,
      accessType
    })
  }, [reportSuspiciousActivity])

  return {
    reportSuspiciousActivity,
    reportDataAccess,
    isLoading
  }
}