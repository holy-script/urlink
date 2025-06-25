'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { LinkGenerator } from '@/components/LinkGenerator';
import { Sparkles, Play, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function CreateLinkPage() {
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');

  const handleVideoTutorial = (videoUrl: string, title: string) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(title);
    setShowVideoOverlay(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header with Video Tutorial Button */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Create Smart Link</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Generate a deep link that works across all platforms and track its performance.
            </p>
          </div>

          {/* Video Tutorial Button next to header */}
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={() => handleVideoTutorial('https://www.youtube.com/embed/dQw4w9WgXcQ', 'How to Create Smart Links')}
              className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 group-hover:bg-gray-50 transition-colors">
                <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">Watch Video</div>
                  <div className="font-medium text-gray-700 text-xs">Tutorial</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Step 1: Basic Info */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
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
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-[#5d17eb] sm:p-6">
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

        {/* Video Tutorial Overlay */}
        <Dialog open={showVideoOverlay} onOpenChange={setShowVideoOverlay}>
          <DialogContent className="max-w-4xl w-full bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{currentVideoTitle}</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                src={currentVideoUrl}
                title={currentVideoTitle}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
