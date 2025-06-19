"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertTriangle, Copy, Edit, Share2, ExternalLink, Search, Plus, QrCode, Eye, EyeOff, RefreshCw, Calendar, MousePointerClick, Download, X, Trash2, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import Image from 'next/image';
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

// Updated interface to match your database schema
interface SmartLink {
  id: string;
  title: string | null;
  original_url: string;
  android_deeplink: string | null;
  ios_deeplink: string | null;
  platform: string;
  short_code: string;
  clicks: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  isqrenabled: boolean; // Updated to match your database column name
  deleted_at: string | null;
}

// Filter types
type StatusFilter = 'all' | 'active' | 'inactive' | 'deleted';
type PlatformFilter = 'all' | 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'amazon' | 'google-maps';
type QRFilter = 'all' | 'enabled' | 'disabled';

export default function MyLinksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<SmartLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);
  const [showQROverlay, setShowQROverlay] = useState(false);
  const [selectedLinkForQR, setSelectedLinkForQR] = useState<SmartLink | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [qrFilter, setQRFilter] = useState<QRFilter>('all');

  useEffect(() => {
    if (user) {
      loadLinks();
    }
  }, [user]);

  useEffect(() => {
    // Apply all filters
    let filtered = links;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(link =>
        link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.short_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(link => {
        switch (statusFilter) {
          case 'active':
            return link.is_active && !link.deleted_at;
          case 'inactive':
            return !link.is_active && !link.deleted_at;
          case 'deleted':
            return !!link.deleted_at;
          default:
            return true;
        }
      });
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(link => link.platform === platformFilter);
    }

    // QR filter
    if (qrFilter !== 'all') {
      filtered = filtered.filter(link => {
        switch (qrFilter) {
          case 'enabled':
            return link.isqrenabled;
          case 'disabled':
            return !link.isqrenabled;
          default:
            return true;
        }
      });
    }

    setFilteredLinks(filtered);
  }, [searchQuery, links, statusFilter, platformFilter, qrFilter]);

  // Mock data for demonstration when no links exist
  const getMockLinks = (): SmartLink[] => [
    {
      id: 'mock-1',
      title: 'Instagram Post',
      original_url: 'https://instagram.com/p/ABC123',
      android_deeplink: 'intent://instagram.com/p/ABC123/#Intent;package=com.instagram.android;scheme=https;end',
      ios_deeplink: 'instagram://media?id=ABC123',
      platform: 'instagram',
      short_code: 'demo1',
      clicks: 42,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      isqrenabled: true,
      deleted_at: null
    },
    {
      id: 'mock-2',
      title: 'YouTube Video',
      original_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      android_deeplink: 'vnd.youtube:dQw4w9WgXcQ',
      ios_deeplink: 'youtube://dQw4w9WgXcQ',
      platform: 'youtube',
      short_code: 'demo2',
      clicks: 128,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      isqrenabled: true,
      deleted_at: null
    },
    {
      id: 'mock-3',
      title: 'Amazon Product',
      original_url: 'https://amazon.com/dp/B08N5WRWNW',
      android_deeplink: 'com.amazon.mobile.shopping.web://amazon.com/dp/B08N5WRWNW/',
      ios_deeplink: 'com.amazon.mobile.shopping.web://amazon.com/dp/B08N5WRWNW/',
      platform: 'amazon',
      short_code: 'demo3',
      clicks: 76,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      isqrenabled: false,
      deleted_at: null
    }
  ];

  const loadLinks = async () => {
    if (!user) {
      setError('Please log in to view your links');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📋 Loading links for user:', user.id);

      // Load user's links including soft deleted ones - updated to match new schema with isqrenabled
      const { data: linksData, error: linksError } = await supabase
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
          updated_at,
          deleted_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) {
        throw linksError;
      }

      const userLinks = linksData || [];
      console.log('✅ Found', userLinks.length, 'links (including deleted)');

      // Filter out deleted links for the main view unless specifically viewing deleted
      const activeLinks = userLinks.filter(link => !link.deleted_at);

      // If no active links, show overlay with mock data
      if (activeLinks.length === 0) {
        setShowOnboardingOverlay(true);
        setLinks(getMockLinks());
        setIsLoading(false);
        return;
      }

      // Get click data for these links
      const linkIds = userLinks.map(link => link.id);

      const { data: clicksData, error: clicksError } = await supabase
        .from('link_clicks')
        .select('link_id')
        .in('link_id', linkIds);

      if (clicksError) {
        console.warn('Error fetching clicks:', clicksError);
      }

      const clicks = clicksData || [];

      // Count clicks per link
      const clickCounts = new Map<string, number>();
      clicks.forEach(click => {
        const currentCount = clickCounts.get(click.link_id) || 0;
        clickCounts.set(click.link_id, currentCount + 1);
      });

      // Add click counts to links
      const linksWithCounts: SmartLink[] = userLinks.map(link => ({
        ...link,
        clicks: clickCounts.get(link.id) || 0
      }));

      setLinks(linksWithCounts);
      setShowOnboardingOverlay(false);
      console.log('✅ Links loaded successfully');

    } catch (err) {
      console.error('💥 Error loading links:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load links';
      setError(errorMessage);
      toast.error('Failed to load links', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getShortUrl = (platform: string, shortCode: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com';
    return `${baseUrl}/${platform}/${shortCode}`;
  };

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleShare = (link: SmartLink) => {
    const shortUrl = getShortUrl(link.platform, link.short_code);
    if (navigator.share) {
      navigator.share({
        title: link.title || 'Smart Link',
        url: shortUrl
      });
    } else {
      copyToClipboard(shortUrl, link.id);
    }
  };

  const handleEdit = (shortCode: string) => {
    if (shortCode.startsWith('demo')) {
      toast.info('This is a demo link. Create your first real link to get started!');
      router.push('/create-link');
      return;
    }
    router.push(`/edit-link/${shortCode}`);
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    if (linkId.startsWith('mock-')) {
      toast.info('This is a demo link. Create your first real link to get started!');
      return;
    }

    try {
      const { error } = await supabase
        .from('links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === linkId ? { ...link, is_active: !currentStatus } : link
        )
      );

      toast.success(`Link ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const handleSoftDelete = async (linkId: string) => {
    if (linkId.startsWith('mock-')) {
      toast.info('This is a demo link. Create your first real link to get started!');
      return;
    }

    try {
      const { error } = await supabase
        .from('links')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === linkId ? {
            ...link,
            deleted_at: new Date().toISOString(),
            is_active: false
          } : link
        )
      );

      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const handleRestore = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({
          deleted_at: null,
          is_active: true
        })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === linkId ? {
            ...link,
            deleted_at: null,
            is_active: true
          } : link
        )
      );

      toast.success('Link restored successfully');
    } catch (error) {
      console.error('Error restoring link:', error);
      toast.error('Failed to restore link');
    }
  };

  const handleShowQR = (link: SmartLink) => {
    if (link.id.startsWith('mock-')) {
      toast.info('This is a demo link. Create your first real link to get started!');
      return;
    }
    setSelectedLinkForQR(link);
    setShowQROverlay(true);
  };

  const downloadQRCode = () => {
    if (!selectedLinkForQR) return;

    const canvas = document.querySelector('#qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-code-${selectedLinkForQR.short_code}.png`;
      link.href = url;
      link.click();
      toast.success('QR code downloaded successfully!');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlatformFilter('all');
    setQRFilter('all');
  };

  // Platform SVG Icons
  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "w-5 h-5", fill: "currentColor" };

    switch (platform) {
      case 'instagram':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        );
      case 'amazon':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.61-4.516.61-2.265 0-4.463-.356-6.604-1.07-2.09-.698-3.99-1.726-5.715-3.08-.13-.102-.16-.22-.1-.33l.048-.1zm21.968-3.21c.33-.43.15-.94-.54-1.53-.68-.58-1.92-1.08-3.73-1.49-1.81-.41-3.67-.62-5.58-.62-1.91 0-3.77.21-5.58.62-1.81.41-3.05.91-3.73 1.49-.69.59-.87 1.1-.54 1.53.33.43.87.65 1.62.65.75 0 1.57-.22 2.46-.65.89-.43 1.83-.65 2.82-.65.99 0 1.93.22 2.82.65.89.43 1.71.65 2.46.65.75 0 1.29-.22 1.62-.65z" />
          </svg>
        );
      case 'google-maps':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M19.527 4.799c1.212 2.608.937 5.678-.8 8.063-1.738 2.386-4.634 3.729-7.552 3.729s-5.814-1.343-7.552-3.729c-1.737-2.385-2.012-5.455-.8-8.063C4.035 2.191 7.521.007 11.175 0s7.14 2.191 8.352 4.799zM12 8c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        );
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-100 text-pink-800',
      youtube: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      tiktok: 'bg-gray-100 text-gray-800',
      amazon: 'bg-orange-100 text-orange-800',
      'google-maps': 'bg-green-100 text-green-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">Error Loading Links</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadLinks}
              className="mt-4 text-red-600 hover:text-red-700 bg-white border border-red-300 hover:bg-red-50"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2 text-red-600" />
              <span className="text-red-600">Try Again</span>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className={`px-4 py-6 sm:px-6 lg:px-8 ${showOnboardingOverlay ? 'blur-sm pointer-events-none' : ''}`}>
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Smart Links</h1>
                <p className="text-gray-600 mt-1">
                  {showOnboardingOverlay
                    ? "Here's a preview of how your links will look. Create your first link to get started!"
                    : `Manage and track your ${filteredLinks.length} smart links`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={loadLinks}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                  <RefreshCw className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700">Refresh</span>
                </Button>
                <Button
                  onClick={() => router.push('/create-link')}
                  className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-white">Create Link</span>
                </Button>
              </div>
            </div>

            {/* Demo Banner */}
            {showOnboardingOverlay && (
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-800">Links Preview</h3>
                    <p className="text-purple-600 text-sm">This is how your links page will look with real data. Create your first link to get started!</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Search and Filters */}
            <Card className="p-4 sm:p-6 bg-white border border-gray-200">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-gray-900 bg-gray-50 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {filteredLinks.length} of {links.length} links
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                      <SelectTrigger className="w-full sm:w-32 bg-white text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All Status</SelectItem>
                        <SelectItem value="active" className="text-gray-900 hover:bg-gray-100">Active</SelectItem>
                        <SelectItem value="inactive" className="text-gray-900 hover:bg-gray-100">Inactive</SelectItem>
                        <SelectItem value="deleted" className="text-gray-900 hover:bg-gray-100">Deleted</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Platform Filter */}
                    <Select value={platformFilter} onValueChange={(value: PlatformFilter) => setPlatformFilter(value)}>
                      <SelectTrigger className="w-full sm:w-36 bg-white text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All Platforms</SelectItem>
                        <SelectItem value="instagram" className="text-gray-900 hover:bg-gray-100">Instagram</SelectItem>
                        <SelectItem value="youtube" className="text-gray-900 hover:bg-gray-100">YouTube</SelectItem>
                        <SelectItem value="facebook" className="text-gray-900 hover:bg-gray-100">Facebook</SelectItem>
                        <SelectItem value="tiktok" className="text-gray-900 hover:bg-gray-100">TikTok</SelectItem>
                        <SelectItem value="amazon" className="text-gray-900 hover:bg-gray-100">Amazon</SelectItem>
                        <SelectItem value="google-maps" className="text-gray-900 hover:bg-gray-100">Google Maps</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* QR Filter */}
                    <Select value={qrFilter} onValueChange={(value: QRFilter) => setQRFilter(value)}>
                      <SelectTrigger className="w-full sm:w-32 bg-white text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]">
                        <SelectValue placeholder="QR Code" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All QR</SelectItem>
                        <SelectItem value="enabled" className="text-gray-900 hover:bg-gray-100">QR Enabled</SelectItem>
                        <SelectItem value="disabled" className="text-gray-900 hover:bg-gray-100">QR Disabled</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Clear Filters Button */}
                    {(searchQuery || statusFilter !== 'all' || platformFilter !== 'all' || qrFilter !== 'all') && (
                      <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <span className="text-gray-700">Clear All</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Links List - Changed from grid to single column */}
            <div className="space-y-4">
              {filteredLinks.map((link: SmartLink) => {
                const shortUrl = getShortUrl(link.platform, link.short_code);
                const isCopied = copiedLinkId === link.id;
                const isDeleted = !!link.deleted_at;

                return (
                  <Card key={link.id} className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow ${isDeleted ? 'bg-red-50 border-red-200 opacity-75' : 'bg-white border-gray-200'
                    }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Section - Link Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${getPlatformColor(link.platform)}`}>
                              {getPlatformIcon(link.platform)}
                            </div>
                            <Badge className={`${getPlatformColor(link.platform)} font-medium text-xs`}>
                              {link.platform.replace('-', ' ')}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {isDeleted ? (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  Deleted
                                </Badge>
                              ) : (
                                <>
                                  <Badge
                                    className={`${link.is_active
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                      } text-xs`}
                                  >
                                    {link.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Badge
                                    className={`${link.isqrenabled
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                      } text-xs`}
                                  >
                                    {link.isqrenabled ? 'QR' : 'No QR'}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          <h3 className={`text-lg font-semibold mb-2 ${isDeleted ? 'text-red-700' : 'text-gray-900'
                            }`}>
                            {link.title || 'Untitled Smart Link'}
                          </h3>

                          <div className="space-y-2">
                            {/* Short URL */}
                            <div className={`p-3 rounded-md border ${isDeleted ? 'bg-red-100 border-red-200' : ''
                              }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Image
                                  src="/favicon2.png"
                                  alt="URLINK"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4"
                                />
                                <p className={`text-xs ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>Short URL</p>
                              </div>
                              <p className={`font-mono text-sm ${isDeleted ? 'text-red-700' : 'text-[#5e17eb]'
                                }`}>
                                {shortUrl}
                              </p>
                            </div>

                            {/* Original URL */}
                            <div>
                              <p className={`text-xs mb-1 ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>Original URL</p>
                              <p className={`text-sm ${isDeleted ? 'text-red-700' : 'text-gray-700'
                                } break-all`}>
                                {link.original_url}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Stats and Actions */}
                        <div className="flex flex-col lg:items-end gap-4">
                          {/* Stats */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <MousePointerClick className={`w-4 h-4 ${isDeleted ? 'text-red-500' : 'text-gray-500'}`} />
                              <span className={`text-sm font-semibold ${isDeleted ? 'text-red-700' : 'text-gray-900'
                                }`}>
                                {link.clicks.toLocaleString()}
                              </span>
                              <span className={`text-xs ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>clicks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${isDeleted ? 'text-red-500' : 'text-gray-500'}`} />
                              <span className={`text-xs ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>
                                {format(new Date(link.created_at), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {isDeleted ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50 hover:text-green-700 px-3 py-2 transition-colors"
                                  onClick={() => handleRestore(link.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  <span className="text-green-600">Restore</span>
                                </Button>
                                <span className="text-xs text-red-600">
                                  Deleted {format(new Date(link.deleted_at!), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            ) : (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`p-2 transition-colors ${isCopied
                                        ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                                        : 'text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb]'
                                        }`}
                                      onClick={() => copyToClipboard(shortUrl, link.id)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                    <p className="text-gray-700">{isCopied ? 'Copied!' : 'Copy Link'}</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors"
                                      onClick={() => handleEdit(link.short_code)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                    <p className="text-gray-700">Edit Link</p>
                                  </TooltipContent>
                                </Tooltip>

                                {/* QR Code Button - Only show if QR is enabled */}
                                {link.isqrenabled && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors"
                                        onClick={() => handleShowQR(link)}
                                      >
                                        <QrCode className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                      <p className="text-gray-700">Show QR Code</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors"
                                      onClick={() => handleShare(link)}
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                    <p className="text-gray-700">Share Link</p>
                                  </TooltipContent>
                                </Tooltip> */}

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-700 hover:bg-gray-200 hover:text-blue-600 p-2 transition-colors"
                                      onClick={() => window.open(shortUrl, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                    <p className="text-gray-700">Open Link</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`p-2 transition-colors ${link.is_active
                                        ? 'text-gray-700 hover:bg-gray-200 hover:text-red-600'
                                        : 'text-gray-700 hover:bg-gray-200 hover:text-green-600'
                                        }`}
                                      onClick={() => handleToggleActive(link.id, link.is_active)}
                                    >
                                      {link.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                    <p className="text-gray-700">{link.is_active ? 'Deactivate' : 'Activate'}</p>
                                  </TooltipContent>
                                </Tooltip>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-gray-700 hover:bg-gray-200 hover:text-red-600 p-2 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                        <p className="text-gray-700">Delete Link</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-white border border-gray-200">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-gray-900">Delete Link</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-600">
                                        Are you sure you want to delete this link? This action will deactivate the link and move it to deleted items. You can restore it later if needed.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
                                        <span className="text-gray-700">Cancel</span>
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleSoftDelete(link.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <span className="text-white">Delete Link</span>
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State for Search/Filters */}
            {filteredLinks.length === 0 && (searchQuery || statusFilter !== 'all' || platformFilter !== 'all' || qrFilter !== 'all') && !showOnboardingOverlay && (
              <Card className="p-8 text-center bg-white border border-gray-200">
                <div className="text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
                  <p className="text-gray-500 mb-4">
                    No links match your current filters. Try adjusting your search or filters.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="text-gray-700">Clear All Filters</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* QR Code Overlay */}
        {showQROverlay && selectedLinkForQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 max-w-md w-full mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQROverlay(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={getShortUrl(selectedLinkForQR.platform, selectedLinkForQR.short_code)}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedLinkForQR.title || 'Smart Link'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {getShortUrl(selectedLinkForQR.platform, selectedLinkForQR.short_code)}
                  </p>
                </div>

                <Button
                  onClick={downloadQRCode}
                  className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4 text-white" />
                  <span className="text-white">Download QR Code</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Onboarding Overlay - only shows when no real links exist */}
        {showOnboardingOverlay && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="relative w-full overflow-y-auto">
              <OnboardingProgress
                showAsOverlay={true}
                onDismiss={() => {
                  // Can't dismiss if no links created
                  toast.info('Create your first link to access your dashboard!');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
