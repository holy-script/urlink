'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ExternalLink, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/lib/AuthContext';
// import { loadStripe } from '@stripe/stripe-js';

interface User {
  plan: string;
  click_usage: number;
  click_limit: number;
  payment_method_id: string | null;
  payment_method_last4: string | null;
}

interface Invoice {
  month: string;
  clicks_billable: number;
  total_amount: number;
  invoice_url: string;
}

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function BillingPage() {
  // const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Billing');

  const [userPlan, setUserPlan] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    // Set mock user data for demonstration purposes
    console.log(t('console.loadingUserData'));

    setUserPlan({
      plan: 'pay-per-click',
      click_usage: 600,
      click_limit: 500,
      payment_method_id: 'pm_1234567890',
      payment_method_last4: '4242',
    });
    setInvoices([
      {
        month: '2023-10',
        clicks_billable: 600,
        total_amount: 0.3,
        invoice_url: 'https://example.com/invoice/1234567890',
      },
      {
        month: '2023-09',
        clicks_billable: 500,
        total_amount: 0.15,
        invoice_url: 'https://example.com/invoice/0987654321',
      },
    ]);
    setLoading(false);
    console.log(t('console.userDataLoaded'));
  }, [t]);

  // useEffect(() => {
  //   if (user) {
  //     loadUserData();
  //     loadInvoices();
  //     checkShowLimitDialog();
  //   }
  // }, [user]);

  async function loadUserData() {
    // if (!user?.id) {
    //   setError(t('errors.userNotAuthenticated'));
    //   setLoading(false);
    //   return;
    // }

    // try {
    //   console.log(t('console.loadingUserData'));
    //   const { data, error } = await supabase
    //     .from('users')
    //     .select('plan, click_usage, click_limit, payment_method_id, payment_method_last4')
    //     .eq('id', user.id)
    //     .maybeSingle();

    //   if (error) {
    //     console.error('Error loading user data:', error);
    //     throw new Error(t('errors.failedToLoad'));
    //   }

    //   if (!data) {
    //     throw new Error(t('errors.userNotFound'));
    //   }

    //   setUserPlan(data);
    //   console.log(t('console.userDataLoaded'));
    // } catch (error) {
    //   console.error('Error loading user data:', error);
    //   setError(error instanceof Error ? error.message : t('errors.failedToLoad'));
    //   toast.error(t('errors.failedBillingData'));
    // } finally {
    //   setLoading(false);
    // }
  }

  async function loadInvoices() {
    // if (!user?.id) return;

    // try {
    //   console.log(t('console.loadingInvoices'));
    //   const { data, error } = await supabase
    //     .from('monthly_usage')
    //     .select('month, clicks_billable, total_amount, invoice_url')
    //     .eq('user_id', user.id)
    //     .eq('billed', true)
    //     .order('month', { ascending: false })
    //     .limit(6);

    //   if (error) {
    //     console.error('Error loading invoices:', error);
    //     throw new Error(t('errors.failedInvoiceHistory'));
    //   }

    //   setInvoices(data);
    //   console.log(t('console.invoicesLoaded'));
    // } catch (error) {
    //   console.error('Error loading invoices:', error);
    //   toast.error(t('errors.failedInvoiceHistory'));
    // }
  }

  const checkShowLimitDialog = () => {
    // const hasShownDialog = localStorage.getItem('limitDialogShown');
    // if (!hasShownDialog && userPlan?.click_usage >= 500) {
    //   setShowLimitDialog(true);
    //   localStorage.setItem('limitDialogShown', 'true');
    // }
  };

  const handleUpgrade = async () => {
    // setUpgradeLoading(true);
    // try {
    //   console.log(t('console.startingCheckout'));
    //   const stripe = await stripePromise;
    //   if (!stripe) throw new Error(t('errors.stripeNotLoaded'));

    //   const { data: { sessionId }, error } = await supabase
    //     .functions.invoke('create-checkout-session', {
    //       body: { userId: user?.id }
    //     });

    //   if (error) throw error;

    //   const { error: stripeError } = await stripe.redirectToCheckout({
    //     sessionId
    //   });

    //   if (stripeError) throw stripeError;
    //   console.log(t('console.checkoutStarted'));
    // } catch (error) {
    //   console.error('Error starting checkout:', error);
    //   toast.error(t('errors.failedCheckout'));
    // } finally {
    //   setUpgradeLoading(false);
    // }
  };

  const handleAddPaymentMethod = async () => {
    // setPaymentLoading(true);
    // try {
    //   console.log(t('console.setupPayment'));
    //   const stripe = await stripePromise;
    //   if (!stripe) throw new Error(t('errors.stripeNotLoaded'));

    //   const { data: { sessionId }, error } = await supabase
    //     .functions.invoke('create-setup-intent', {
    //       body: { userId: user?.id }
    //     });

    //   if (error) throw error;

    //   const { error: stripeError } = await stripe.redirectToCheckout({
    //     sessionId
    //   });

    //   if (stripeError) throw stripeError;
    //   console.log(t('console.paymentSetup'));
    // } catch (error) {
    //   console.error('Error setting up payment:', error);
    //   toast.error(t('errors.failedPaymentSetup'));
    // } finally {
    //   setPaymentLoading(false);
    // }
  };

  const getEstimatedCost = () => {
    if (!userPlan || userPlan.click_usage <= 500) return 0;
    return ((userPlan.click_usage - 500) * 0.003).toFixed(2);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-4 bg-red-50 border-red-200 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-red-800">{t('errors.loadingTitle')}</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full sm:w-auto"
              variant="outline"
            >
              {t('errors.tryAgain')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !userPlan) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">{t('loading.billingData')}</p>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = (userPlan.click_usage / userPlan.click_limit) * 100;
  const estimatedCost = getEstimatedCost();
  const clicksRemaining = Math.max(0, userPlan.click_limit - userPlan.click_usage);
  const excessClicks = Math.max(0, userPlan.click_usage - 500);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full space-y-4 sm:space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('header.title')}</h1>

          {/* Current Plan */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">{t('currentPlan.title')}</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={`w-fit ${userPlan.click_usage >= 500
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        {userPlan.click_usage >= 500 ? t('currentPlan.badges.payPerClick') : t('currentPlan.badges.freeTier')}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        {userPlan.click_usage >= 500
                          ? t('currentPlan.tooltips.payPerClick')
                          : t('currentPlan.tooltips.freeTier')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-sm text-gray-600">
                  {userPlan.plan === 'free' && t('currentPlan.descriptions.free')}
                  {userPlan.plan === 'pay-per-click' && t('currentPlan.descriptions.payPerClick')}
                </div>
              </div>
              {userPlan.plan === 'free' && (
                <Button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="w-full sm:w-auto"
                >
                  {upgradeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loading.loading')}
                    </>
                  ) : (
                    t('currentPlan.upgradeButton')
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Usage This Month */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl">{t('usage.title')}</h2>
            <div className="space-y-4">
              <div>
                <div className="flex flex-col gap-1 text-sm mb-3 sm:flex-row sm:justify-between sm:gap-0 sm:mb-2 text-gray-600">
                  <span className="font-medium">
                    {t('usage.clicksUsed', { used: userPlan.click_usage, limit: userPlan.click_limit })}
                  </span>
                  <span className="text-gray-600">
                    {t('usage.clicksLeft', { remaining: clicksRemaining })}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, usagePercentage)}
                  className={`h-3 sm:h-2 ${userPlan.click_usage >= 500
                    ? 'bg-gray-100 [&>div]:bg-amber-500'
                    : 'bg-gray-100 [&>div]:bg-[#5e17eb]'
                    }`}
                />
              </div>

              {userPlan.click_usage >= userPlan.click_limit && !userPlan.payment_method_id && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto sm:mx-0 sm:mt-0.5 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <p className="text-amber-800 font-medium">{t('usage.limitReached.title')}</p>
                      <p className="text-amber-700 text-sm mt-1">
                        {t('usage.limitReached.description')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {userPlan.click_usage >= 500 && (
                <div className="bg-blue-50 rounded-lg p-4 text-center sm:text-left">
                  <p className="text-blue-800 font-medium">
                    {t('usage.estimatedCost.title', { cost: estimatedCost })}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    {t('usage.estimatedCost.description', { excess: excessClicks })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl">{t('paymentMethod.title')}</h2>

            {userPlan.payment_method_id ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-center sm:justify-start">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {t('paymentMethod.cardDisplay', { last4: userPlan.payment_method_last4 || '****' })}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddPaymentMethod}
                  disabled={paymentLoading}
                  className="w-full sm:w-auto bg-[#5e17eb] text-white hover:bg-[#4c14c7] border-none flex items-center justify-center"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loading.updating')}
                    </>
                  ) : (
                    t('paymentMethod.updateButton')
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">{t('paymentMethod.noMethod.message')}</p>
                <Button
                  onClick={handleAddPaymentMethod}
                  disabled={paymentLoading}
                  className="w-full sm:w-auto"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loading.settingUp')}
                    </>
                  ) : (
                    t('paymentMethod.noMethod.addButton')
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Billing History */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl">{t('billingHistory.title')}</h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 px-4 sm:px-0 text-sm font-medium text-gray-500">{t('billingHistory.headers.month')}</th>
                      <th className="pb-3 px-4 sm:px-0 text-sm font-medium text-gray-500">{t('billingHistory.headers.clicks')}</th>
                      <th className="pb-3 px-4 sm:px-0 text-sm font-medium text-gray-500">{t('billingHistory.headers.amount')}</th>
                      <th className="pb-3 px-4 sm:px-0 text-sm font-medium text-gray-500">{t('billingHistory.headers.invoice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 px-4 sm:px-0 text-sm text-gray-900">
                          <div className="font-medium sm:font-normal">
                            {format(new Date(invoice.month + '-01'), 'MMM yyyy')}
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-0 text-sm text-gray-900">
                          {invoice.clicks_billable.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 sm:px-0 text-sm text-gray-900 font-medium">
                          €{invoice.total_amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 sm:px-0 text-sm">
                          <a
                            href={invoice.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 flex items-center justify-center sm:justify-start"
                          >
                            <span className="sm:mr-1">{t('billingHistory.viewInvoice')}</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {invoices.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <p>{t('billingHistory.noHistory')}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
          <DialogContent className="mx-4 max-w-md sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center sm:text-left">{t('dialog.limitReached.title')}</DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <p>
                  {t('dialog.limitReached.description', { cost: estimatedCost })}
                </p>
                {!userPlan.payment_method_id && (
                  <p className="text-red-600 font-medium">
                    {t('dialog.limitReached.paymentRequired')}
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
              {!userPlan.payment_method_id ? (
                <Button
                  onClick={handleAddPaymentMethod}
                  disabled={paymentLoading}
                  className="w-full sm:w-auto"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loading.settingUp')}
                    </>
                  ) : (
                    t('paymentMethod.noMethod.addButton')
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowLimitDialog(false)}
                  className="w-full sm:w-auto"
                >
                  {t('dialog.limitReached.gotItButton')}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
