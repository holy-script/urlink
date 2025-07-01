'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function VerificationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-6 bg-white shadow-lg text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified Successfully!
          </h1>
          <p className="text-gray-600">
            {reason === 'already-verified'
              ? 'Your email was already verified.'
              : 'Your email address has been confirmed. You can now access all features of your account.'
            }
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => router.push('/account')}
            variant="outline"
            className="w-full"
          >
            Manage Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
