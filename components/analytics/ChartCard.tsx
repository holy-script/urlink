import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  timeRange?: string;
  onTimeRangeChange?: (value: string) => void;
}

export function ChartCard({
  title,
  subtitle,
  children,
  actions,
  timeRange,
  onTimeRangeChange
}: ChartCardProps) {
  return (
    <Card className="p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {timeRange && onTimeRangeChange && (
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          )}
          {actions}
        </div>
      </div>
      <div className="h-[300px]">
        {children}
      </div>
    </Card>
  );
}
