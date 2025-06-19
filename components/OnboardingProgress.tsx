import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle2, Circle, ArrowRight, Loader2, X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface OnboardingSteps {
  createLink: boolean;
  setupBilling: boolean;
  customizeProfile: boolean;
}

interface UserData {
  is_email_verified: boolean;
  name: string | null;
  avatar_url: string | null;
}

interface OnboardingProgressProps {
  showAsOverlay?: boolean;
  onDismiss?: () => void;
}

export function OnboardingProgress({ showAsOverlay = false, onDismiss }: OnboardingProgressProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingSteps>({
    createLink: false,
    setupBilling: false,
    customizeProfile: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCreatedLink, setHasCreatedLink] = useState(false);

  useEffect(() => {
    if (user) {
      loadOnboardingData();
    }
  }, [user]);

  const loadOnboardingData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('📋 Loading onboarding data for user:', user.id);

      // Load user profile data (matching your schema)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          is_email_verified,
          name,
          avatar_url
        `)
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('❌ Error loading user data:', userError);
        throw userError;
      }

      // Check if user has created any links (matching your schema)
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(1);

      if (linksError) {
        console.error('❌ Error loading links data:', linksError);
        throw linksError;
      }

      // Check if user has active subscription or billing setup
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .limit(1);

      if (subscriptionError) {
        console.error('❌ Error loading subscription data:', subscriptionError);
        // Don't throw here, billing is optional
      }

      // Calculate completion status
      const hasCreatedLinkStatus = (linksData?.length || 0) > 0;
      const hasBilling = (subscriptionData?.length || 0) > 0;

      // Profile is complete if: email verified AND has name AND has avatar
      const hasCompleteProfile = userData.is_email_verified &&
        userData.name &&
        userData.name.trim() !== '' &&
        userData.avatar_url;

      setHasCreatedLink(hasCreatedLinkStatus);
      setSteps({
        createLink: hasCreatedLinkStatus,
        setupBilling: hasBilling,
        customizeProfile: hasCompleteProfile,
      });

      console.log('✅ Onboarding data loaded:', {
        hasCreatedLink: hasCreatedLinkStatus,
        hasBilling,
        hasCompleteProfile,
        userData: {
          emailVerified: userData.is_email_verified,
          hasName: !!userData.name,
          hasAvatar: !!userData.avatar_url
        }
      });

    } catch (err) {
      console.error('💥 Error loading onboarding data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load onboarding data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress
  const progress = Object.values(steps).filter(Boolean).length / Object.keys(steps).length * 100;
  const completed = Object.values(steps).every((step) => step);

  // Don't show if completed
  if (completed && !isLoading) return null;

  const tasks = [
    {
      key: 'createLink' as const,
      label: 'Create your first smart link',
      description: 'Generate a smart deep link for any platform',
      path: '/create-link',
      completed: steps.createLink,
      priority: 1,
      required: true, // This is required to dismiss onboarding
    },
    {
      key: 'customizeProfile' as const,
      label: 'Complete your profile',
      description: 'Verify email, add your name and profile picture',
      path: '/account',
      completed: steps.customizeProfile,
      priority: 2,
      required: false,
    },
    {
      key: 'setupBilling' as const,
      label: 'Set up billing (optional)',
      description: 'Add a payment method for unlimited clicks',
      path: '/billing',
      completed: steps.setupBilling,
      priority: 3,
      required: false,
    },
  ];

  // Sort tasks by priority, with incomplete tasks first
  const sortedTasks = tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Incomplete tasks first
    }
    return a.priority - b.priority;
  });

  const handleDismiss = () => {
    if (hasCreatedLink) {
      if (onDismiss) {
        onDismiss();
      } else {
        router.push('/dashboard');
      }
    }
  };

  if (error) {
    const content = (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <Circle className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Unable to load onboarding progress</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <Button
          onClick={loadOnboardingData}
          className="mt-4"
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </Card>
    );

    return showAsOverlay ? content : content;
  }

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="p-6 bg-white shadow-lg shadow-[#5e17eb]/10 relative">
          {/* Close button - only show if at least one link is created */}
          {hasCreatedLink && (
            <Button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
              variant="ghost"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Get Started with URLINK</h2>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#5e17eb]" />}
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
          </div>

          <Progress
            value={progress}
            className="mb-6 h-2 bg-gray-100 [&>div]:bg-[#5e17eb]"
          />

          {showAsOverlay && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                <p className="text-sm text-purple-800 font-medium">
                  This is how your dashboard will look with real data. Complete the steps below to get started!
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <motion.div
                key={task.key}
                initial={false}
                animate={{ opacity: task.completed ? 0.7 : 1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {task.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </motion.div>
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.label}
                      {task.required && !task.completed && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {task.description}
                    </p>
                    {task.key === 'customizeProfile' && !task.completed && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-400">
                          Need to: verify email, add name & profile picture
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {!task.completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(task.path)}
                    className="text-[#5e17eb] hover:text-[#4e13c4] hover:bg-purple-50"
                    disabled={isLoading}
                  >
                    {task.key === 'setupBilling' ? 'Setup' : 'Start'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {task.completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(task.path)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    View
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                {completed ? 'All set! 🎉' : `${Object.values(steps).filter(Boolean).length} of ${Object.keys(steps).length} completed`}
              </p>
              {!completed && (
                <Button
                  onClick={loadOnboardingData}
                  variant="ghost"
                  size="sm"
                  className="text-[#5e17eb] hover:text-[#4e13c4]"
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              )}
            </div>

            {completed ? (
              <p className="text-sm text-gray-500">
                You're ready to make the most of URLINK! Start creating smart links and tracking your engagement.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {hasCreatedLink
                    ? "Great! You've created your first link. Complete the remaining steps to get the most out of URLINK."
                    : showAsOverlay
                      ? "Create your first link to unlock your dashboard and start tracking engagement."
                      : "Create your first link to unlock your dashboard and start tracking engagement."
                  }
                </p>
                {!hasCreatedLink && (
                  <p className="text-xs text-gray-400">
                    * Required to access dashboard
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-2 sm:flex-row">
              {!steps.createLink && (
                <Button
                  onClick={() => router.push('/create-link')}
                  className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white flex-1"
                  disabled={isLoading}
                >
                  Create First Link
                </Button>
              )}

              {hasCreatedLink && (
                <Button
                  onClick={handleDismiss}
                  className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white flex-1 border-black border"
                  disabled={isLoading}
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {!steps.customizeProfile && hasCreatedLink && (
                <Button
                  onClick={() => router.push('/account')}
                  variant="outline"
                  className="border-[#5e17eb] text-[#5e17eb] hover:bg-[#5e17eb] hover:text-white flex-1"
                  disabled={isLoading}
                >
                  Complete Profile
                </Button>
              )}
            </div>

            {/* Help text */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Need help?{' '}
                <button
                  onClick={() => router.push('/support')}
                  className="text-[#5e17eb] hover:underline"
                >
                  Contact support
                </button>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );

  // Return content directly (no overlay wrapper in this component)
  return content;
}
