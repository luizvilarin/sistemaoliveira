
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusIndicatorProps {
  entregue: boolean;
  visualizada: boolean;
  className?: string;
}

const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  entregue,
  visualizada,
  className
}) => {
  if (!entregue) {
    return (
      <Check className={cn('h-3 w-3 text-gray-400', className)} />
    );
  }

  if (visualizada) {
    return (
      <CheckCheck className={cn('h-3 w-3 text-blue-500', className)} />
    );
  }

  return (
    <CheckCheck className={cn('h-3 w-3 text-gray-400', className)} />
  );
};

export default MessageStatusIndicator;
