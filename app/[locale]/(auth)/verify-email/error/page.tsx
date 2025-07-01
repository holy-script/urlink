'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';

const errorMessages = {
  'missing-token': 'No verification token provided.',
  'expired': 'This verification link has expired. Please request a new one.',
  'invalid': 'This verification link is invalid or has already been used.',
  'user-not-found': 'User account not found.',
  'update-failed': 'Failed to update verification status. Please try again.',
  'unknown': 'An unexpected error occurred during verification.'
};

export default function VerificationErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') as keyof typeof errorMessages || 'unknown';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-6 bg-white shadow-lg text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Failed
          </h1>
          <p className="text-gray-600">
            {errorMessages[reason]}
          </p>
        </div>

        <div className="space-y-3">
          {(reason === 'expired' || reason === 'invalid' || reason === 'update-failed') && (
            <Button
              onClick={() => router.push('/account')}
              className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Request New Verification
            </Button>
          )}
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
