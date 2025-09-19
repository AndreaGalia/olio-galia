import React from 'react';
import { getStatusLabel, getStatusColor } from '@/utils/statusUtils';
import type { StatusType } from '@/types/admin';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  size?: 'sm' | 'md';
}

const StatusBadge = React.memo(function StatusBadge({ status, type, size = 'sm' }: StatusBadgeProps) {
  const label = getStatusLabel(status, type);
  const colorClasses = getStatusColor(status, type);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex font-semibold rounded-full border ${sizeClasses[size]} ${colorClasses}`}>
      {label}
    </span>
  );
});

export default StatusBadge;