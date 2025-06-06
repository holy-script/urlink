import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
// import { useOnboardingStore } from '../lib/store';
import { useRouter } from '@/i18n/navigation';

export function OnboardingProgress() {
  const router = useRouter();
  // const { steps, progress, completed } = useOnboardingStore();

  const steps = {
    createLink: true, // Replace with actual state
    viewAnalytics: false, // Replace with actual state
    setupBilling: false, // Replace with actual state
    customizeProfile: false, // Replace with actual state
  };
  const progress = Object.values(steps).filter(Boolean).length / Object.keys(steps).length * 100;
  const completed = Object.values(steps).every((step) => step);

  if (completed) return null;

  const tasks = [
    {
      key: 'createLink' as const,
      label: 'Create your first link',
      description: 'Generate a smart deep link for any platform',
      path: '/create-link',
      completed: steps.createLink,
    },
    {
      key: 'viewAnalytics' as const,
      label: 'View your analytics',
      description: 'Track clicks and engagement metrics',
      path: '/analytics',
      completed: steps.viewAnalytics,
    },
    {
      key: 'setupBilling' as const,
      label: 'Set up billing',
      description: 'Add a payment method for when you need more clicks',
      path: '/billing',
      completed: steps.setupBilling,
    },
    {
      key: 'customizeProfile' as const,
      label: 'Complete your profile',
      description: 'Add your details and preferences',
      path: '/account',
      completed: steps.customizeProfile,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Get Started with URLINK</h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>

          <Progress
            value={progress}
            className="mb-6 h-2 bg-gray-100 [&>div]:bg-[#5e17eb]"
          />

          <div className="space-y-4">
            {tasks.map((task) => (
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
                    <span className={`text-sm font-medium ${task.completed ? 'text-gray-500' : 'text-gray-900'}`}>
                      {task.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {task.description}
                    </p>
                  </div>
                </div>
                {!task.completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(task.path)}
                    className="text-[#5e17eb] hover:text-[#4e13c4] hover:bg-purple-50"
                  >
                    Start
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Complete these steps to get the most out of URLINK. Need help?{' '}
              <button
                onClick={() => router.push('/support')}
                className="text-[#5e17eb] hover:underline"
              >
                Contact support
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
