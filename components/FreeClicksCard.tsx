import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { CreditCard, RefreshCw } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FreeClicksCardProps {
  total?: number;
  onUpgradeClick: () => void;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

interface UserClickData {
  lifetimeClicksUsed: number;
  isEmailVerified: boolean;
  hasActiveSubscription: boolean;
  unverifiedClicksLimit: number;
  verifiedFreeClicksLimit: number;
}

export function FreeClicksCard({
  total = 500,
  onUpgradeClick,
  refreshTrigger
}: FreeClicksCardProps) {
  const { user } = useAuth();
  const [clickData, setClickData] = useState<UserClickData>({
    lifetimeClicksUsed: 0,
    isEmailVerified: false,
    hasActiveSubscription: false,
    unverifiedClicksLimit: 100,
    verifiedFreeClicksLimit: 500
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClickData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user status and verification info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_email_verified')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Check for active subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('status, canceled_at')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

      const hasActiveSubscription = !!subscriptionData &&
        (subscriptionData.canceled_at === null || new Date(subscriptionData.canceled_at) > new Date());

      // Get user's active links
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (linksError) throw linksError;

      const linkIds = (linksData || []).map(link => link.id);

      // Get total clicks for user's links
      let totalClicks = 0;
      if (linkIds.length > 0) {
        const { data: clicksData, error: clicksError } = await supabase
          .from('link_clicks')
          .select('id')
          .in('link_id', linkIds);

        if (clicksError) throw clicksError;
        totalClicks = clicksData?.length || 0;
      }

      setClickData({
        lifetimeClicksUsed: totalClicks,
        isEmailVerified: userData.is_email_verified,
        hasActiveSubscription,
        unverifiedClicksLimit: 100,
        verifiedFreeClicksLimit: 500
      });

    } catch (err) {
      console.error('Error loading click data:', err);
      setError('Failed to load click data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClickData();
  }, [user, refreshTrigger]);

  // Determine the appropriate limits based on user status
  const getClickLimits = () => {
    if (clickData.hasActiveSubscription) {
      return {
        freeLimit: Infinity,
        isUnlimited: true
      };
    }

    if (!clickData.isEmailVerified) {
      return {
        freeLimit: clickData.unverifiedClicksLimit,
        isUnlimited: false
      };
    }

    return {
      freeLimit: clickData.verifiedFreeClicksLimit,
      isUnlimited: false
    };
  };

  const { freeLimit, isUnlimited } = getClickLimits();
  const used = clickData.lifetimeClicksUsed;
  const remaining = isUnlimited ? Infinity : Math.max(0, freeLimit - used);
  const percentage = isUnlimited ? 0 : Math.min(100, (used / freeLimit) * 100);
  const isExceeded = !isUnlimited && used >= freeLimit;

  if (isLoading) {
    return (
      <Card className="bg-[#F4ECFF] p-5 w-full">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#5F40C2]" />
          <h3 className="text-sm font-medium text-[#5F40C2]">Loading Click Usage...</h3>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 p-5 w-full border-red-200">
        <h3 className="text-sm font-medium text-red-600 mb-2">Click Usage</h3>
        <p className="text-sm text-red-600">{error}</p>
        <Button
          onClick={loadClickData}
          variant="outline"
          size="sm"
          className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-[#F4ECFF] p-5 w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[#5F40C2]">Click Usage</h3>
        <Button
          onClick={loadClickData}
          variant="ghost"
          size="sm"
          className="p-1 h-auto text-[#5F40C2] hover:bg-white/50"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-[#5F40C2]">{used.toLocaleString()}</span>
        {!isUnlimited && (
          <span className="text-base text-gray-500">/ {freeLimit.toLocaleString()}</span>
        )}
        {isUnlimited && (
          <span className="text-base text-green-600 font-medium">Unlimited</span>
        )}
      </div>

      {/* Progress bar - only show if not unlimited */}
      {!isUnlimited && (
        <div className="mt-4">
          <Progress
            value={percentage}
            className={cn(
              "h-2",
              isExceeded
                ? "bg-white/50 [&>div]:bg-red-500"
                : "bg-white/50 [&>div]:bg-[#7B3EFF]"
            )}
          />
        </div>
      )}

      {/* Status Messages */}
      {isUnlimited ? (
        <p className="mt-3 text-sm text-green-600 font-medium">
          ✨ Unlimited clicks with your subscription
        </p>
      ) : !clickData.isEmailVerified ? (
        <>
          <p className="mt-3 text-sm text-orange-600 font-medium">
            {remaining > 0
              ? `${remaining} clicks left (unverified account)`
              : 'Verify your email to get more free clicks'
            }
          </p>
          {isExceeded && (
            <Button
              onClick={() => window.location.href = '/account'}
              className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Verify Email for More Clicks
            </Button>
          )}
        </>
      ) : !isExceeded ? (
        <p className="mt-3 text-sm text-green-600 font-medium">
          You have {remaining.toLocaleString()} free clicks left
        </p>
      ) : (
        <>
          <div className="flex items-start mt-3">
            <p className="text-sm text-red-600 font-medium">
              You've used all free clicks. Add payment method for pay-per-click.
            </p>
          </div>
          <Button
            onClick={onUpgradeClick}
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            €{((used - freeLimit) * 0.003).toFixed(2)} estimated for {(used - freeLimit)} extra clicks
          </p>
        </>
      )}
    </Card>
  );
}
