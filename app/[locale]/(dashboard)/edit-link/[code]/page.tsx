'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { Sparkles, QrCode, ArrowLeft, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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
  isqrenabled: boolean; // Updated to match your database column name (lowercase)
  created_at: string;
  updated_at: string;
}

export default function EditLinkPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const shortCode = params.code as string;

  // Form state
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR code settings
  const [qrColor, setQrColor] = useState('#000000');

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

      console.log('📋 Loading link data for short code:', shortCode);

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
        console.error('❌ Error loading link:', error);
        if (error.code === 'PGRST116') {
          setError('Link not found or you don\'t have permission to edit it.');
        } else {
          throw error;
        }
        return;
      }

      if (!data) {
        setError('Link not found.');
        return;
      }

      setLinkData(data);
      setTitle(data.title || '');
      setIsActive(data.is_active);
      setQrEnabled(data.isqrenabled);

      console.log('✅ Link data loaded successfully');

    } catch (err) {
      console.error('💥 Error loading link data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load link data';
      setError(errorMessage);
      toast.error('Failed to load link data', {
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
      console.log('💾 Saving link changes...');

      const { error } = await supabase
        .from('links')
        .update({
          title: title.trim() || null,
          is_active: isActive,
          isqrenabled: qrEnabled, // Updated to match your database column name
          updated_at: new Date().toISOString()
        })
        .eq('id', linkData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error updating link:', error);
        throw error;
      }

      console.log('✅ Link updated successfully');
      toast.success('Link updated successfully!');

      // Update local state
      setLinkData(prev => prev ? {
        ...prev,
        title: title.trim() || null,
        is_active: isActive,
        isqrenabled: qrEnabled,
        updated_at: new Date().toISOString()
      } : null);

    } catch (err) {
      console.error('💥 Error saving link:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      toast.error('Failed to save changes', {
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
      console.log('🗑️ Deleting link...');

      const { error } = await supabase
        .from('links')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', linkData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting link:', error);
        throw error;
      }

      console.log('✅ Link deleted successfully');
      toast.success('Link deleted successfully!');

      // Redirect to my-links page
      router.push('/my-links');

    } catch (err) {
      console.error('💥 Error deleting link:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete link';
      toast.error('Failed to delete link', {
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
      case 'instagram': return 'Instagram';
      case 'youtube': return 'YouTube';
      case 'amazon': return 'Amazon';
      case 'tiktok': return 'TikTok';
      case 'facebook': return 'Facebook';
      case 'google-maps': return 'Google Maps';
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
              <h3 className="font-medium text-red-800 mb-2">Error Loading Link</h3>
              <p className="text-red-600 mb-4">{error || 'Link not found'}</p>
              <Button
                onClick={() => router.push('/my-links')}
                variant="outline"
                className="bg-white text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-red-600">Back to My Links</span>
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
            <span className="text-gray-700">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Smart Link</h1>
            <p className="text-gray-600">Modify your link settings and preferences</p>
          </div>
        </div>

        {/* Link Info Card */}
        <Card className="p-6 bg-white border border-gray-200 shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Link Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Platform</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-900">{getPlatformDisplay(linkData.platform)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Short URL</label>
              <div className="mt-1 p-3 bg-blue-50 rounded-lg font-mono text-sm text-blue-800 border border-blue-200">
                {shortUrl}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Original URL</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm break-all text-gray-900 border border-gray-200">
                {linkData.original_url}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 bg-white border border-gray-200 shadow-lg shadow-[#5e17eb]/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title (Optional)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a custom title for your link"
                  className="mt-1 text-gray-900 bg-gray-50 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A custom title helps you identify this link in your dashboard
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Link Status</label>
                  <p className="text-xs text-gray-500">
                    Inactive links will not redirect and show an error page
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
                    QR Code
                  </label>
                  <p className="text-xs text-gray-500">
                    Enable QR code generation for this link
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Preview</h3>
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
                QR code will redirect to: {shortUrl}
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
                  <span className="text-white">Delete Link</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border border-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900">Delete Link</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Are you sure you want to delete this link? This action cannot be undone.
                    The link will stop working immediately and all analytics data will be preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
                    <span className="text-gray-700">Cancel</span>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <span className="text-white">{isDeleting ? 'Deleting...' : 'Delete Link'}</span>
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
                  <span className="text-white">Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white">Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
