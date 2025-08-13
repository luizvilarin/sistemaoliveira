
import React from 'react';
import { cn } from '@/lib/utils';

interface UserStatusIndicatorProps {
  status: 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({ 
  status, 
  size = 'md', 
  showText = false,
  className 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'ocupado':
        return 'bg-red-500';
      case 'ausente':
        return 'bg-yellow-500';
      case 'invisivel':
        return 'bg-gray-400';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'ocupado':
        return 'Ocupado';
      case 'ausente':
        return 'Ausente';
      case 'invisivel':
        return 'Invisível';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className={cn(
          'rounded-full',
          getSizeClasses(),
          getStatusColor()
        )} 
      />
      {showText && (
        <span className="text-xs text-gray-600">{getStatusText()}</span>
      )}
    </div>
  );
};

export default UserStatusIndicator;
