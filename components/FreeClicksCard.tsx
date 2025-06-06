import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface FreeClicksCardProps {
  used: number;
  total?: number;
  hasPaymentMethod?: boolean;
  onUpgradeClick: () => void;
}

export function FreeClicksCard({
  used,
  total = 500,
  hasPaymentMethod = false,
  onUpgradeClick
}: FreeClicksCardProps) {
  const remaining = Math.max(0, total - used);
  const percentage = Math.min(100, (used / total) * 100);
  const isExceeded = used >= total;

  return (
    <Card className="bg-[#F4ECFF] p-5 w-full">
      <h3 className="text-sm font-medium text-[#5F40C2] mb-3">Click Usage</h3>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-[#5F40C2]">{used}</span>
        <span className="text-base text-gray-500">/ {total}</span>
      </div>

      <div className="mt-4">
        <Progress
          value={percentage}
          className={cn(
            "h-2",
            isExceeded
              ? "bg-white/50 [&>div]:bg-amber-500"
              : "bg-white/50 [&>div]:bg-[#7B3EFF]"
          )}
        />
      </div>

      {!isExceeded ? (
        <p className="mt-3 text-sm text-green-600 font-medium">
          You have {remaining} free clicks left
        </p>
      ) : !hasPaymentMethod ? (
        <>
          <div className="flex items-start mt-3">
            <p className="text-sm text-red-600 font-medium">
              You've reached your free limit. Add a payment method to continue.
            </p>
          </div>
          <Button
            onClick={onUpgradeClick}
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mt-3">
            You're now on pay-per-click
          </p>
          <p className="text-sm text-amber-600 font-medium mt-1">
            €{((used - total) * 0.003).toFixed(2)} billed at month end
          </p>
        </>
      )}
    </Card>
  );
}
