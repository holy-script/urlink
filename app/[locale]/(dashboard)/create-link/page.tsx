'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LinkGenerator } from '@/components/LinkGenerator';
import { Sparkles } from 'lucide-react';

export default function CreateLinkPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8 sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Create Smart Link</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Generate a deep link that works across all platforms and track its performance.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Step 1: Basic Info */}
          <Card className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5e17eb] text-white text-sm font-medium">
                    1
                  </span>
                  <span>Basic Information</span>
                </div>
              </h2>
              <p className="text-sm text-gray-500 mt-2 text-center sm:text-left sm:mt-1">
                Start by entering the URL you want to convert into a smart link.
              </p>
            </div>

            <LinkGenerator />
          </Card>

          {/* Success Tips */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-none sm:p-6">
            <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <Sparkles className="w-5 h-5 text-[#5e17eb] mx-auto sm:mx-0 sm:mt-1 flex-shrink-0" />
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 text-base sm:text-lg">
                  Tips for better performance
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-[#5e17eb] font-bold mt-0.5">•</span>
                    <span>Use UTM parameters to track your marketing campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5e17eb] font-bold mt-0.5">•</span>
                    <span>Generate a QR code for offline-to-online conversion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5e17eb] font-bold mt-0.5">•</span>
                    <span>Test your links before sharing them widely</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5e17eb] font-bold mt-0.5">•</span>
                    <span>Monitor analytics to optimize your strategy</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
