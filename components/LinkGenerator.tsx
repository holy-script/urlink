'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { Sparkles, HelpCircle, QrCode, Tags, Smartphone } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Platform type definition
type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'google-maps' | 'amazon';

interface DeepLinks {
  android: string;
  ios: string;
}

export function LinkGenerator() {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [manualPlatform, setManualPlatform] = useState<Platform | null>(null);
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

  // Platform detection logic
  const detectPlatform = (url: string): Platform | null => {
    const normalizedUrl = url.toLowerCase();

    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (normalizedUrl.includes('instagram.com')) {
      return 'instagram';
    }
    if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com')) {
      return 'facebook';
    }
    if (normalizedUrl.includes('tiktok.com')) {
      return 'tiktok';
    }
    if (normalizedUrl.includes('maps.google.com') || normalizedUrl.includes('goo.gl/maps')) {
      return 'google-maps';
    }
    if (normalizedUrl.includes('amazon.com') || normalizedUrl.includes('amzn.to')) {
      return 'amazon';
    }

    return null;
  };

  // Deep link generation functions
  const generateInstagramDeepLinks = (originalUrl: string): DeepLinks => {
    try {
      const url = new URL(originalUrl);
      const pathParts = url.pathname.split('/');

      if (pathParts.includes('p')) {
        const postIndex = pathParts.indexOf('p');
        const postId = pathParts[postIndex + 1];

        return {
          android: `intent://instagram.com/p/${postId}/#Intent;package=com.instagram.android;scheme=https;end`,
          ios: `instagram://media?id=${postId}`
        };
      } else if (pathParts.includes('reel')) {
        const reelIndex = pathParts.indexOf('reel');
        const reelId = pathParts[reelIndex + 1];

        return {
          android: `intent://instagram.com/reel/${reelId}/#Intent;package=com.instagram.android;scheme=https;end`,
          ios: `instagram://media?id=${reelId}`
        };
      } else {
        return {
          android: `intent://${url.hostname}${url.pathname}#Intent;package=com.instagram.android;scheme=https;end`,
          ios: `instagram://user?username=${pathParts[1] || ''}`
        };
      }
    } catch {
      return { android: originalUrl, ios: originalUrl };
    }
  };

  const generateYouTubeDeepLinks = (originalUrl: string): DeepLinks => {
    try {
      const url = new URL(originalUrl);
      let videoId = '';

      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else if (url.searchParams.has('v')) {
        videoId = url.searchParams.get('v') || '';
      } else if (url.pathname.includes('/watch')) {
        videoId = url.searchParams.get('v') || '';
      }

      if (videoId) {
        return {
          android: `vnd.youtube:${videoId}`,
          ios: `youtube://${videoId}`
        };
      }

      return {
        android: `vnd.youtube:${url.pathname}${url.search}`,
        ios: `youtube://${url.pathname}${url.search}`
      };
    } catch {
      return { android: originalUrl, ios: originalUrl };
    }
  };

  const generateAmazonDeepLinks = (originalUrl: string): DeepLinks => {
    try {
      const url = new URL(originalUrl);
      const asinMatch = url.pathname.match(/\/dp\/([A-Z0-9]{10})/);

      if (asinMatch) {
        const asin = asinMatch[1];
        return {
          android: `com.amazon.mobile.shopping.web://amazon.com/dp/${asin}/`,
          ios: `com.amazon.mobile.shopping.web://amazon.com/dp/${asin}/`
        };
      }

      return { android: originalUrl, ios: originalUrl };
    } catch {
      return { android: originalUrl, ios: originalUrl };
    }
  };

  const generateFacebookDeepLinks = (originalUrl: string): DeepLinks => {
    try {
      const url = new URL(originalUrl);

      if (url.pathname.includes('/posts/')) {
        const postId = url.pathname.split('/posts/')[1];
        return {
          android: `fb://post/${postId}`,
          ios: `fb://post/${postId}`
        };
      }

      return {
        android: `fb://page/${url.pathname}`,
        ios: `fb://page/${url.pathname}`
      };
    } catch {
      return { android: originalUrl, ios: originalUrl };
    }
  };

  const generateTikTokDeepLinks = (originalUrl: string): DeepLinks => {
    try {
      const url = new URL(originalUrl);

      if (url.pathname.includes('/video/')) {
        const videoId = url.pathname.split('/video/')[1];
        return {
          android: `snssdk1233://video/${videoId}`,
          ios: `tiktok://video/${videoId}`
        };
      }

      return {
        android: `snssdk1233://${url.pathname}`,
        ios: `tiktok://${url.pathname}`
      };
    } catch {
      return { android: originalUrl, ios: originalUrl };
    }
  };

  const generateGoogleMapsDeepLinks = (originalUrl: string): DeepLinks => {
    try {
      const url = new URL(originalUrl);
      const query = encodeURIComponent(originalUrl);

      return {
        android: `geo:0,0?q=${query}`,
        ios: `maps://?q=${query}`
      };
    } catch {
      return { android: originalUrl, ios: originalUrl };
    }
  };

  const generateDeepLinks = (originalUrl: string, platform: Platform): DeepLinks => {
    switch (platform) {
      case 'instagram':
        return generateInstagramDeepLinks(originalUrl);
      case 'youtube':
        return generateYouTubeDeepLinks(originalUrl);
      case 'amazon':
        return generateAmazonDeepLinks(originalUrl);
      case 'facebook':
        return generateFacebookDeepLinks(originalUrl);
      case 'tiktok':
        return generateTikTokDeepLinks(originalUrl);
      case 'google-maps':
        return generateGoogleMapsDeepLinks(originalUrl);
      default:
        return { android: originalUrl, ios: originalUrl };
    }
  };

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (url.trim()) {
      const detected = detectPlatform(url);
      setDetectedPlatform(detected);
      if (!manualPlatform && detected) {
        setManualPlatform(detected);
      }
    } else {
      setDetectedPlatform(null);
    }
  }, [url]);

  const canShowQRPreview = qrEnabled && url && (url.startsWith('http://') || url.startsWith('https://'));
  const currentPlatform = manualPlatform || detectedPlatform;

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

    return !data;
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

    return null;
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

    if (!currentPlatform) {
      setError('Please select a platform or enter a URL from a supported platform');
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

      // Generate deep links
      const deepLinks = generateDeepLinks(finalUrl, currentPlatform);

      // Generate unique short code
      const shortCode = await generateUniqueShortCode();
      if (!shortCode) {
        throw new Error('Failed to generate unique short code. Please try again.');
      }

      // Extract title from URL (optional)
      let title = null;
      try {
        const urlObj = new URL(finalUrl);
        title = urlObj.hostname;
      } catch {
        // Ignore title extraction errors
      }

      console.log('📝 Creating link with QR enabled:', qrEnabled);

      // Insert link into database using updated schema with isqrenabled (lowercase)
      const { data: linkData, error: insertError } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          original_url: finalUrl,
          android_deeplink: deepLinks.android,
          ios_deeplink: deepLinks.ios,
          platform: currentPlatform,
          short_code: shortCode,
          title: title,
          is_active: true,
          isqrenabled: qrEnabled // Updated to match your database column name
        })
        .select('id, short_code, platform, isqrenabled')
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to create link. Please try again.');
      }

      console.log('✅ Link created successfully with QR enabled:', linkData.isqrenabled);

      // Success!
      const smartUrl = `smarturlink.com/${linkData.platform}/${linkData.short_code}`;
      toast.success('Smart link created successfully!', {
        description: `URL: ${smartUrl}${qrEnabled ? ' (QR Code enabled)' : ''}`,
        action: {
          label: 'View Links',
          onClick: () => router.push('/my-links')
        }
      });

      // Clear form
      setUrl('');
      setManualPlatform(null);
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
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a link from Instagram, YouTube, Amazon, TikTok, Facebook, or Google Maps..."
              className="w-full text-base py-4 px-4 rounded-lg border-2 border-gray-200 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] transition-all sm:text-lg sm:py-6 sm:px-6 sm:rounded-xl text-gray-900 placeholder:text-gray-500 bg-white"
              required
              disabled={isLoading}
            />
            {detectedPlatform && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Smartphone className="w-4 h-4 text-green-600" />
                Detected platform: <span className="font-medium capitalize text-green-700">{detectedPlatform}</span>
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Platform</label>
            <Select
              value={manualPlatform || ''}
              onValueChange={(value) => setManualPlatform(value as Platform)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] bg-gray-100 placeholder:text-gray-500 [&[data-placeholder]>span]:text-gray-500 [&>svg]:text-gray-600">
                <SelectValue placeholder="Select platform (auto-detected if available)" />
              </SelectTrigger>
              <SelectContent className='text-gray-900 bg-white border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]'>
                <SelectItem value="youtube" className='text-gray-900 hover:bg-gray-100 focus:bg-gray-100'>
                  YouTube
                </SelectItem>
                <SelectItem value="instagram" className='text-gray-900 hover:bg-gray-100 focus:bg-gray-100'>
                  Instagram
                </SelectItem>
                <SelectItem value="facebook" className='text-gray-900 hover:bg-gray-100 focus:bg-gray-100'>
                  Facebook
                </SelectItem>
                <SelectItem value="tiktok" className='text-gray-900 hover:bg-gray-100 focus:bg-gray-100'>
                  TikTok
                </SelectItem>
                <SelectItem value="google-maps" className='text-gray-900 hover:bg-gray-100 focus:bg-gray-100'>
                  Google Maps
                </SelectItem>
                <SelectItem value="amazon" className='text-gray-900 hover:bg-gray-100 focus:bg-gray-100'>
                  Amazon
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Smart URL */}
          {currentPlatform && url && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong className="text-blue-900">Smart URL Preview:</strong> smarturlink.com/{currentPlatform}/[your-code]
              </div>
            </div>
          )}

          {/* Feature Toggles */}
          <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-gray-700" />
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
                  <Tags className="w-4 h-4 text-gray-700" />
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
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-white text-gray-700 border border-gray-200">
                    <p className="text-gray-700">Track your marketing campaigns with UTM parameters</p>
                  </TooltipContent>
                </Tooltip>
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
                      className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 block sm:hidden">Medium</label>
                    <Input
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="utm_medium (e.g., cpc)"
                      disabled={isLoading}
                      className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 block sm:hidden">Campaign</label>
                    <Input
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      placeholder="utm_campaign (e.g., spring_sale)"
                      disabled={isLoading}
                      className="w-full text-sm sm:text-base text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* QR Code Preview */}
          {qrEnabled && canShowQRPreview && currentPlatform && (
            <Card className="p-4 bg-gray-50 border-gray-200 sm:p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center sm:text-left sm:text-base">
                QR Code Preview
              </h3>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <QRCodeCanvas
                    value={`https://smarturlink.com/${currentPlatform}/preview`}
                    size={150}
                    fgColor={qrColor}
                    level="H"
                    includeMargin
                    className="sm:w-[200px] sm:h-[200px]"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3 sm:text-sm">
                QR code will redirect to your smart link
              </p>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg sm:text-base sm:p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !url.trim() || !currentPlatform}
            className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 text-base rounded-lg flex items-center justify-center gap-2 transition-all sm:py-6 sm:text-lg sm:rounded-xl sm:gap-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white sm:h-6 sm:w-6"></div>
                <span className="text-white">Creating your smart link...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-white">Create smart link {qrEnabled && '+ QR Code'}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
