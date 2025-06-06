'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { Sparkles, HelpCircle, QrCode, Tags } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LinkGenerator() {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [url, setUrl] = useState('');
  const [utmEnabled, setUtmEnabled] = useState(false);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UTM parameters
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // QR code settings
  const [qrColor, setQrColor] = useState('#000000');

  // Preview QR code when URL is valid
  const canShowQRPreview = qrEnabled && url && (url.startsWith('http://') || url.startsWith('https://'));

  // Generate unique short code
  const generateShortCode = (): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let result = '';
    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Check if short code is unique
  const isShortCodeUnique = async (shortCode: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('links')
      .select('short_code')
      .eq('short_code', shortCode)
      .maybeSingle();

    if (error) {
      console.error('Error checking short code uniqueness:', error);
      return false;
    }

    return !data; // Returns true if no existing record found
  };

  // Generate unique short code with retries
  const generateUniqueShortCode = async (): Promise<string | null> => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const shortCode = generateShortCode();
      const isUnique = await isShortCodeUnique(shortCode);

      if (isUnique) {
        return shortCode;
      }

      attempts++;
    }

    return null; // Failed to generate unique code
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast.error('Please log in to create links');
      router.push('/login');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      // Validate and normalize URL
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }

      // Validate URL format
      try {
        new URL(finalUrl);
      } catch {
        throw new Error('Invalid URL format. Please enter a valid URL.');
      }

      // Add UTM parameters if enabled
      if (utmEnabled && (utmSource.trim() || utmMedium.trim() || utmCampaign.trim())) {
        const urlObj = new URL(finalUrl);
        if (utmSource.trim()) urlObj.searchParams.set('utm_source', utmSource.trim());
        if (utmMedium.trim()) urlObj.searchParams.set('utm_medium', utmMedium.trim());
        if (utmCampaign.trim()) urlObj.searchParams.set('utm_campaign', utmCampaign.trim());
        finalUrl = urlObj.toString();
      }

      // Generate unique short code
      const shortCode = await generateUniqueShortCode();
      if (!shortCode) {
        throw new Error('Failed to generate unique short code. Please try again.');
      }

      // Extract title from URL (optional - can be done later)
      let title = null;
      try {
        const urlObj = new URL(finalUrl);
        title = urlObj.hostname; // Use hostname as fallback title
      } catch {
        // Ignore title extraction errors
      }

      // Insert link into database
      const { data: linkData, error: insertError } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          destination_url: finalUrl,
          short_code: shortCode,
          title: title,
          is_active: true
        })
        .select('id, short_code')
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to create link. Please try again.');
      }

      // Success!
      toast.success('Link created successfully!', {
        description: `Short code: ${linkData.short_code}`,
        action: {
          label: 'View Links',
          onClick: () => router.push('/my-links')
        }
      });

      // Clear form
      setUrl('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setError(null);

      // Redirect to my-links page
      router.push('/my-links');

    } catch (error) {
      console.error('Error creating link:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error('Failed to create link', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                disabled={isLoading}
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
                disabled={isLoading}
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
                    disabled={isLoading}
                    className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 block sm:hidden">Medium</label>
                  <Input
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="utm_medium (e.g., cpc)"
                    disabled={isLoading}
                    className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 block sm:hidden">Campaign</label>
                  <Input
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="utm_campaign (e.g., spring_sale)"
                    disabled={isLoading}
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
                  value={url.startsWith('http') ? url : `https://${url}`}
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
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white sm:h-6 sm:w-6"></div>
              Creating your link...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              Create smart link
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
