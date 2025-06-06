'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
// import { useLinkStore } from '@/lib/store';
// import { useAuth } from '@/lib/AuthContext';
import { generateDeepLink } from '@/lib/deepLinkGenerator';
import { Sparkles, HelpCircle, QrCode, Tags } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LinkGenerator() {
  const router = useRouter();
  // const { user } = useAuth();
  // const {
  //   pendingUrl,
  //   setPendingUrl,
  //   utmEnabled,
  //   setUtmEnabled,
  //   qrEnabled,
  //   setQrEnabled
  // } = useLinkStore();
  // Set mock state for demonstration
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [utmEnabled, setUtmEnabled] = useState(false);
  const [qrEnabled, setQrEnabled] = useState(true);
  // State for URL input and loading/error handling

  const [url, setUrl] = useState(pendingUrl || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UTM parameters
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // QR code settings
  const [qrColor, setQrColor] = useState('#000000');

  useEffect(() => {
    // Set mock data for demonstration
    // setPendingUrl('https://example.com');
    // setUrl('https://example.com');
    // setUtmEnabled(false);
    // setQrEnabled(true);
    // setUtmSource('');
    // setUtmMedium('');
    // setUtmCampaign('');
    // setQrColor('#000000');
    // setError(null);
    setIsLoading(false);
  }, []);

  // Preview QR code when URL is valid
  const canShowQRPreview = qrEnabled && url && url.startsWith('http');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // if (!user) {
    //   setPendingUrl(url);
    //   router.push('/login');
    //   return;
    // }

    // setIsLoading(true);

    // try {
    //   // Add UTM parameters if enabled
    //   let finalUrl = url;
    //   if (utmEnabled && (utmSource || utmMedium || utmCampaign)) {
    //     const params = new URLSearchParams();
    //     if (utmSource) params.append('utm_source', utmSource);
    //     if (utmMedium) params.append('utm_medium', utmMedium);
    //     if (utmCampaign) params.append('utm_campaign', utmCampaign);
    //     finalUrl += (finalUrl.includes('?') ? '&' : '?') + params.toString();
    //   }

    //   const result = generateDeepLink(finalUrl);
    //   if (!result) {
    //     throw new Error('Invalid URL. Please check the URL and try again.');
    //   }

    //   // Save to database and handle QR code generation
    //   // Implementation depends on your backend setup

    //   toast({
    //     title: "Success",
    //     description: "Link created successfully",
    //   });

    //   // Clear form
    //   setUrl('');
    //   setPendingUrl(null);

    // } catch (error) {
    //   console.error('Error creating link:', error);
    //   setError(error instanceof Error ? error.message : 'Failed to create link');

    //   toast({
    //     title: "Error",
    //     description: error instanceof Error ? error.message : 'Failed to create link',
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5e17eb]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a link from Instagram, YouTube, Amazon..."
            className="w-full text-base py-4 px-4 rounded-lg border-2 border-gray-200 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] transition-all sm:text-lg sm:py-6 sm:px-6 sm:rounded-xl text-gray-900 placeholder:text-gray-500"
            required
            disabled={isLoading}
          />
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </span>
              <Switch
                checked={qrEnabled}
                onCheckedChange={setQrEnabled}
                className="data-[state=checked]:bg-[#5e17eb] [&_[data-state=checked]>span]:bg-white [&_span]:bg-white data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300 data-[state=checked]:border-[#5e17eb] data-[state=unchecked]:border"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tags className="w-4 h-4" />
                UTM Parameters
              </span>
              <Switch
                checked={utmEnabled}
                onCheckedChange={setUtmEnabled}
                className="data-[state=checked]:bg-[#5e17eb] [&_[data-state=checked]>span]:bg-white [&_span]:bg-white data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300 data-[state=checked]:border-[#5e17eb] data-[state=unchecked]:border"
              />
            </div>
          </div>
        </div>

        {/* UTM Parameters Section */}
        {utmEnabled && (
          <Card className="p-4 bg-gray-50 border-gray-200 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 sm:text-base">UTM Parameters</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Track your marketing campaigns with UTM parameters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-3 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 sm:space-y-0">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 block sm:hidden">Source</label>
                  <Input
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="utm_source (e.g., google)"
                    className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 block sm:hidden">Medium</label>
                  <Input
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="utm_medium (e.g., cpc)"
                    className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 block sm:hidden">Campaign</label>
                  <Input
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="utm_campaign (e.g., spring_sale)"
                    className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* QR Code Preview */}
        {qrEnabled && canShowQRPreview && (
          <Card className="p-4 bg-gray-50 border-gray-200 sm:p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center sm:text-left sm:text-base">
              QR Code Preview
            </h3>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeCanvas
                  value={url}
                  size={150}
                  fgColor={qrColor}
                  level="H"
                  includeMargin
                  className="sm:w-[200px] sm:h-[200px]"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3 sm:text-sm">
              This QR code will be included with your smart link
            </p>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg sm:text-base sm:p-4">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 text-base rounded-lg flex items-center justify-center gap-2 transition-all sm:py-6 sm:text-lg sm:rounded-xl sm:gap-3"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          {isLoading ? 'Creating your link...' : 'Create smart link'}
        </Button>
      </div>
    </form>
  );
}
