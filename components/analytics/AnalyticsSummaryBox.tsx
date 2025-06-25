import React from 'react';
import { Card } from '../ui/card';

interface AnalyticsSummaryBoxProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning';
}

export function AnalyticsSummaryBox({
  label,
  value,
  icon,
  trend,
  variant = 'default'
}: AnalyticsSummaryBoxProps) {
  const variantStyles = {
    default: 'bg-white',
    success: 'bg-green-50',
    warning: 'bg-amber-50'
  };

  return (
    <Card className={`${variantStyles[variant]} p-6 shadow-lg shadow-[#5e17eb]/20 bg-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${variant === 'success' ? 'bg-green-100' :
            variant === 'warning' ? 'bg-amber-100' :
              'bg-gray-100'
            }`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
