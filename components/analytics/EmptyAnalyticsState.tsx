import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Sparkles } from 'lucide-react';

interface EmptyAnalyticsStateProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

export function EmptyAnalyticsState({
  title,
  description,
  actionText,
  onAction
}: EmptyAnalyticsStateProps) {
  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">📊</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        <Button
          onClick={onAction}
          className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {actionText}
        </Button>
      </div>
    </Card>
  );
}
