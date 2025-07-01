'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { Sparkles, QrCode, ArrowLeft, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Platform type definition
type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'google-maps' | 'amazon';

interface LinkData {
  id: string;
  title: string | null;
  original_url: string;
  android_deeplink: string | null;
  ios_deeplink: string | null;
  platform: Platform;
  short_code: string;
  is_active: boolean;
  isqrenabled: boolean;
  created_at: string;
  updated_at: string;
}

interface DeepLinks {
  android: string;
  ios: string;
}

export default function EditLinkPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const t = useTranslations('EditLink');
  const shortCode = params.code as string;

  // Form state
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [title, setTitle] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR code settings
  const [qrColor, setQrColor] = useState('#000000');

  // Enhanced platform detection logic (same as LinkGenerator)
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
    // Enhanced Google Maps detection
    if (normalizedUrl.includes('maps.google.com') ||
      normalizedUrl.includes('goo.gl/maps') ||
      normalizedUrl.includes('maps.app.goo.gl') ||
      normalizedUrl.includes('www.google.com/maps')) {
      return 'google-maps';
    }
    // Enhanced Amazon detection for all domains and regional short links
    if (normalizedUrl.match(/amazon\.[a-z]{2,3}(\.[a-z]{2})?/) || // amazon.com, amazon.it, amazon.co.uk, etc.
      normalizedUrl.includes('amzn.to') ||
      normalizedUrl.includes('amzn.eu') ||
      normalizedUrl.includes('amzn.asia') ||
      normalizedUrl.includes('amzn.com')) {
      return 'amazon';
    }

    return null;
  };

  // Deep link generation functions (same as LinkGenerator)
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

  useEffect(() => {
    if (user && shortCode) {
      loadLinkData();
    }
  }, [user, shortCode]);

  const loadLinkData = async () => {
    if (!user || !shortCode) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log(t('console.loadingLink'), shortCode);

      const { data, error } = await supabase
        .from('links')
        .select(`
          id,
          title,
          original_url,
          android_deeplink,
          ios_deeplink,
          platform,
          short_code,
          is_active,
          isqrenabled,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('short_code', shortCode)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error(t('console.linkLoadError'), error);
        if (error.code === 'PGRST116') {
          setError(t('errors.noPermission'));
        } else {
          throw error;
        }
        return;
      }

      if (!data) {
        setError(t('errors.linkNotFound'));
        return;
      }

      setLinkData(data);
      setTitle(data.title || '');
      setOriginalUrl(data.original_url);
      setIsActive(data.is_active);
      setQrEnabled(data.isqrenabled);

      console.log(t('console.linkLoaded'));

    } catch (err) {
      console.error(t('console.linkLoadFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('errors.loadFailed');
      setError(errorMessage);
      toast.error(t('errors.loadFailed'), {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData || !user) return;

    setIsSaving(true);
    try {
      console.log(t('console.savingChanges'));

      // Validate and normalize URL
      let finalUrl = originalUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }

      // Validate URL format
      try {
        new URL(finalUrl);
      } catch {
        throw new Error(t('validation.invalidUrl'));
      }

      // Regenerate deep links if URL changed
      let updatedDeepLinks = {
        android_deeplink: linkData.android_deeplink,
        ios_deeplink: linkData.ios_deeplink
      };

      if (finalUrl !== linkData.original_url) {
        const deepLinks = generateDeepLinks(finalUrl, linkData.platform);
        updatedDeepLinks = {
          android_deeplink: deepLinks.android,
          ios_deeplink: deepLinks.ios
        };
      }

      const { error } = await supabase
        .from('links')
        .update({
          title: title.trim() || null,
          original_url: finalUrl,
          ...updatedDeepLinks,
          is_active: isActive,
          isqrenabled: qrEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error(t('console.updateError'), error);
        throw error;
      }

      console.log(t('console.linkUpdated'));
      toast.success(t('messages.updateSuccess'));

      // Update local state
      setLinkData(prev => prev ? {
        ...prev,
        title: title.trim() || null,
        original_url: finalUrl,
        android_deeplink: updatedDeepLinks.android_deeplink,
        ios_deeplink: updatedDeepLinks.ios_deeplink,
        is_active: isActive,
        isqrenabled: qrEnabled,
        updated_at: new Date().toISOString()
      } : null);

    } catch (err) {
      console.error(t('console.saveFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('errors.saveFailed');
      toast.error(t('errors.saveFailed'), {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!linkData || !user) return;

    setIsDeleting(true);
    try {
      console.log(t('console.deletingLink'));

      const { error } = await supabase
        .from('links')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', linkData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error(t('console.deleteError'), error);
        throw error;
      }

      console.log(t('console.linkDeleted'));
      toast.success(t('messages.deleteSuccess'));

      // Redirect to my-links page
      router.push('/my-links');

    } catch (err) {
      console.error(t('console.deleteFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('errors.deleteFailed');
      toast.error(t('errors.deleteFailed'), {
        description: errorMessage
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getShortUrl = () => {
    if (!linkData) return '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com';
    return `${baseUrl}/${linkData.platform}/${linkData.short_code}`;
  };

  const getPlatformDisplay = (platform: string): string => {
    switch (platform) {
      case 'instagram': return t('platforms.instagram');
      case 'youtube': return t('platforms.youtube');
      case 'amazon': return t('platforms.amazon');
      case 'tiktok': return t('platforms.tiktok');
      case 'facebook': return t('platforms.facebook');
      case 'google-maps': return t('platforms.googleMaps');
      default: return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="text-center">
              <h3 className="font-medium text-red-800 mb-2">{t('errors.loadingTitle')}</h3>
              <p className="text-red-600 mb-4">{error || t('errors.linkNotFound')}</p>
              <Button
                onClick={() => router.push('/my-links')}
                variant="outline"
                className="bg-white text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-red-600">{t('errors.backToLinks')}</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const shortUrl = getShortUrl();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/my-links')}
            variant="outline"
            size="sm"
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-gray-700" />
            <span className="text-gray-700">{t('header.back')}</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
            <p className="text-gray-600">{t('header.subtitle')}</p>
          </div>
        </div>

        {/* Link Info Card */}
        <Card className="p-6 bg-white border border-gray-200 shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('linkInfo.title')}</h2>
          <div className="space-y-4">
            {/* Platform Selection - Read-only */}
            <div>
              <label className="text-sm font-medium text-gray-700">{t('linkInfo.platform')}</label>
              <Select
                value={linkData.platform}
                disabled={true} // Always disabled - platform cannot be changed for existing links
              >
                <SelectTrigger className="mt-1 w-full text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] bg-gray-100 placeholder:text-gray-500 [&[data-placeholder]>span]:text-gray-500 [&>svg]:text-gray-600">
                  <SelectValue placeholder={getPlatformDisplay(linkData.platform)} />
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

            <div>
              <label className="text-sm font-medium text-gray-700">{t('linkInfo.shortUrl')}</label>
              <div className="mt-1 p-3 bg-blue-50 rounded-lg font-mono text-sm text-blue-800 border border-blue-200">
                {shortUrl}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 bg-white border border-gray-200 shadow-lg shadow-[#5e17eb]/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editSettings.title')}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('editSettings.titleField.label')}</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('editSettings.titleField.placeholder')}
                  className="mt-1 text-gray-900 bg-gray-50 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('editSettings.titleField.helpText')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Original URL</label>
                <Input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1 text-gray-900 bg-gray-50 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Update the destination URL. Deep links will be regenerated automatically.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('editSettings.linkStatus.label')}</label>
                  <p className="text-xs text-gray-500">
                    {t('editSettings.linkStatus.helpText')}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-[#5e17eb] [&_[data-state=checked]>span]:bg-white [&_span]:bg-white data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300 data-[state=checked]:border-[#5e17eb] data-[state=unchecked]:border"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-gray-700" />
                    {t('editSettings.qrCode.label')}
                  </label>
                  <p className="text-xs text-gray-500">
                    {t('editSettings.qrCode.helpText')}
                  </p>
                </div>
                <Switch
                  checked={qrEnabled}
                  onCheckedChange={setQrEnabled}
                  className="data-[state=checked]:bg-[#5e17eb] [&_[data-state=checked]>span]:bg-white [&_span]:bg-white data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300 data-[state=checked]:border-[#5e17eb] data-[state=unchecked]:border"
                />
              </div>
            </div>
          </Card>

          {/* QR Code Preview */}
          {qrEnabled && (
            <Card className="p-6 bg-white border border-gray-200 shadow-lg shadow-[#5e17eb]/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('qrPreview.title')}</h3>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <QRCodeCanvas
                    value={shortUrl}
                    size={200}
                    fgColor={qrColor}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                {t('qrPreview.redirectText', { shortUrl })}
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span className="text-white">{t('actions.deleteLink')}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border border-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900">{t('dialogs.deleteLink.title')}</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    {t('dialogs.deleteLink.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
                    <span className="text-gray-700">{t('dialogs.deleteLink.cancel')}</span>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <span className="text-white">{isDeleting ? t('actions.deleting') : t('dialogs.deleteLink.confirm')}</span>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span className="text-white">{t('actions.saving')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white">{t('actions.saveChanges')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
