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
  const t = useTranslations('MyLinksPage');

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
      setError(t('errors.loginRequired'));
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
      toast.success(t('messages.linkCopied'));
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error(t('messages.linkCopyFailed'));
    }
  };

  const handleShare = (link: SmartLink) => {
    const shortUrl = getShortUrl(link.platform, link.short_code);
    if (navigator.share) {
      navigator.share({
        title: link.title || t('links.untitledLink'),
        url: shortUrl
      });
    } else {
      copyToClipboard(shortUrl, link.id);
    }
  };

  const handleEdit = (shortCode: string) => {
    if (shortCode.startsWith('demo')) {
      toast.info(t('messages.demoLinkNotice'));
      router.push('/create-link');
      return;
    }
    router.push(`/edit-link/${shortCode}`);
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    if (linkId.startsWith('mock-')) {
      toast.info(t('messages.demoLinkNotice'));
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

      toast.success(!currentStatus ? t('messages.linkActivated') : t('messages.linkDeactivated'));
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error(t('messages.linkUpdateFailed'));
    }
  };

  const handleSoftDelete = async (linkId: string) => {
    if (linkId.startsWith('mock-')) {
      toast.info(t('messages.demoLinkNotice'));
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

      toast.success(t('messages.linkDeleted'));
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error(t('messages.linkDeleteFailed'));
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

      toast.success(t('messages.linkRestored'));
    } catch (error) {
      console.error('Error restoring link:', error);
      toast.error(t('messages.linkRestoreFailed'));
    }
  };

  const handleShowQR = (link: SmartLink) => {
    if (link.id.startsWith('mock-')) {
      toast.info(t('messages.demoLinkNotice'));
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
      toast.success(t('messages.qrDownloaded'));
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            fillRule="evenodd"
            clipRule="evenodd"
            viewBox="0 0 512 465.46"
            {...iconProps}
          >
            <path
              fillRule="nonzero"
              d="M141.03 228.54c0-21.41 5.28-39.72 15.83-54.92 10.55-15.21 24.98-26.69 43.29-34.45 16.75-7.13 37.39-12.25 61.9-15.36 8.38-.93 22.03-2.17 40.96-3.72v-7.91c0-19.86-2.17-33.21-6.51-40.03-6.52-9.31-16.76-13.97-30.73-13.97h-3.72c-10.24.93-19.08 4.19-26.53 9.78-7.45 5.58-12.26 13.34-14.43 23.27-1.24 6.21-4.34 9.77-9.31 10.71l-53.53-6.52c-5.27-1.24-7.91-4.03-7.91-8.38 0-.93.16-2.02.47-3.26 5.27-27.61 18.23-48.09 38.86-61.44C210.31 9 234.43 1.55 262.05 0h11.64c35.37 0 62.99 9.15 82.85 27.46 3.11 3.12 5.99 6.46 8.61 10.01 2.64 3.57 4.73 6.75 6.28 9.54 1.56 2.79 2.95 6.83 4.19 12.1 1.24 5.28 2.17 8.93 2.8 10.94.62 2.02 1.08 6.36 1.39 13.04.31 6.67.47 10.62.47 11.86v112.64c0 8.07 1.16 15.44 3.49 22.11 2.32 6.68 4.58 11.48 6.75 14.43 2.17 2.95 5.74 7.68 10.7 14.2 1.86 2.79 2.8 5.27 2.8 7.45 0 2.48-1.25 4.65-3.73 6.51-25.76 22.35-39.72 34.45-41.89 36.31-3.72 2.79-8.22 3.1-13.5.93-4.34-3.73-8.14-7.29-11.4-10.71-3.26-3.41-5.59-5.89-6.98-7.44-1.4-1.56-3.65-4.58-6.75-9.08-3.11-4.5-5.28-7.52-6.52-9.08-17.38 18.93-34.44 30.72-51.2 35.38-10.55 3.1-23.58 4.65-39.1 4.65-23.89 0-43.52-7.37-58.88-22.11-15.36-14.74-23.04-35.6-23.04-62.6zm275.55 140.57c.62-1.24 1.55-2.49 2.8-3.73 7.75-5.27 15.2-8.84 22.34-10.7 11.79-3.1 23.27-4.81 34.44-5.12 3.1-.31 6.05-.16 8.84.46 13.97 1.24 22.35 3.57 25.14 6.98 1.24 1.87 1.86 4.66 1.86 8.38v3.26c0 10.86-2.95 23.66-8.84 38.4-5.9 14.74-14.12 26.61-24.67 35.61-1.55 1.24-2.95 1.86-4.19 1.86-.62 0-1.24-.15-1.86-.46-1.86-.93-2.33-2.64-1.4-5.13 11.48-26.99 17.22-45.76 17.22-56.31 0-3.42-.62-5.9-1.86-7.45-3.1-3.72-11.79-5.59-26.06-5.59-5.28 0-11.49.31-18.62.93-7.76.94-14.9 1.86-21.42 2.8-1.86 0-3.1-.31-3.72-.94-.62-.62-.77-1.24-.46-1.86 0-.31.15-.77.46-1.39zM.93 361.2c1.55-2.49 4.03-2.64 7.45-.47 77.57 44.99 161.98 67.49 253.21 67.49 60.81 0 120.86-11.33 180.13-33.98 1.55-.62 3.8-1.55 6.75-2.79s5.04-2.17 6.28-2.79c4.65-1.86 8.3-.93 10.94 2.79 2.64 3.72 1.78 7.14-2.56 10.24-5.59 4.03-12.73 8.69-21.41 13.96-26.69 15.83-56.48 28.09-89.37 36.77-32.89 8.69-65.01 13.04-96.35 13.04-48.41 0-94.18-8.46-137.31-25.37-43.13-16.91-81.77-40.73-115.9-71.45-1.86-1.55-2.79-3.1-2.79-4.65 0-.93.31-1.87.93-2.79zm220.16-141.97c0 12.1 3.03 21.8 9.08 29.09 6.05 7.29 14.19 10.94 24.43 10.94.93 0 2.25-.16 3.96-.47 1.71-.31 2.87-.46 3.49-.46 13.03-3.41 23.12-11.79 30.25-25.13 3.42-5.9 5.98-12.34 7.68-19.32 1.71-6.98 2.64-12.65 2.8-16.99.15-4.35.23-11.48.23-21.41v-11.64c-18 0-31.65 1.24-40.96 3.72-27.31 7.76-40.96 24.98-40.96 51.67z"
            />
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
                <h3 className="font-medium text-red-800">{t('errors.loadingTitle')}</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadLinks}
              className="mt-4 text-red-600 hover:text-red-700 bg-white border border-red-300 hover:bg-red-50"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2 text-red-600" />
              <span className="text-red-600">{t('errors.tryAgain')}</span>
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
          <div className="mx-auto w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('header.title')}</h1>
                <p className="text-gray-600 mt-1">
                  {showOnboardingOverlay
                    ? t('header.subtitlePreview')
                    : t('header.subtitle', { count: filteredLinks.length })
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={loadLinks}
                  variant="outline"
                  className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                  <RefreshCw className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700">{t('header.actions.refresh')}</span>
                </Button>
                <Button
                  onClick={() => router.push('/create-link')}
                  className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-white">{t('header.actions.createLink')}</span>
                </Button>
              </div>
            </div>

            {/* Demo Banner */}
            {showOnboardingOverlay && (
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-800">{t('banner.preview.title')}</h3>
                    <p className="text-purple-600 text-sm">{t('banner.preview.description')}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Search and Filters */}
            <Card className="p-4 sm:p-6 bg-white border border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={t('search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-gray-900 bg-gray-50 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('search.resultsCount', { filtered: filteredLinks.length, total: links.length })}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{t('filters.label')}</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                      <SelectTrigger className="w-full sm:w-32 bg-white text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]">
                        <SelectValue placeholder={t('filters.status.label')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.status.all')}</SelectItem>
                        <SelectItem value="active" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.status.active')}</SelectItem>
                        <SelectItem value="inactive" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.status.inactive')}</SelectItem>
                        <SelectItem value="deleted" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.status.deleted')}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Platform Filter */}
                    <Select value={platformFilter} onValueChange={(value: PlatformFilter) => setPlatformFilter(value)}>
                      <SelectTrigger className="w-full sm:w-36 bg-white text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]">
                        <SelectValue placeholder={t('filters.platform.label')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.all')}</SelectItem>
                        <SelectItem value="instagram" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.instagram')}</SelectItem>
                        <SelectItem value="youtube" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.youtube')}</SelectItem>
                        <SelectItem value="facebook" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.facebook')}</SelectItem>
                        <SelectItem value="tiktok" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.tiktok')}</SelectItem>
                        <SelectItem value="amazon" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.amazon')}</SelectItem>
                        <SelectItem value="google-maps" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.platform.googleMaps')}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* QR Filter */}
                    <Select value={qrFilter} onValueChange={(value: QRFilter) => setQRFilter(value)}>
                      <SelectTrigger className="w-full sm:w-32 bg-white text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb]">
                        <SelectValue placeholder={t('filters.qr.label')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.qr.all')}</SelectItem>
                        <SelectItem value="enabled" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.qr.enabled')}</SelectItem>
                        <SelectItem value="disabled" className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">{t('filters.qr.disabled')}</SelectItem>
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
                        <span className="text-gray-700">{t('filters.clearAll')}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Links List */}
            <div className="space-y-4">
              {filteredLinks.map((link: SmartLink) => {
                const shortUrl = getShortUrl(link.platform, link.short_code);
                const isCopied = copiedLinkId === link.id;
                const isDeleted = !!link.deleted_at;

                return (
                  <Card key={link.id} className={`border rounded-lg shadow-md shadow-[#5e17eb]/20 hover:shadow-lg hover:shadow-[#5e17eb]/20 transition-shadow ${isDeleted ? 'bg-red-50 border-red-200 opacity-75' : 'bg-white border-gray-200'
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
                              {t(`filters.platform.${link.platform.replace('-', '')}`) || link.platform.replace('-', ' ')}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {isDeleted ? (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  {t('links.status.deleted')}
                                </Badge>
                              ) : (
                                <>
                                  <Badge
                                    className={`${link.is_active
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                      } text-xs`}
                                  >
                                    {link.is_active ? t('links.status.active') : t('links.status.inactive')}
                                  </Badge>
                                  <Badge
                                    className={`${link.isqrenabled
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                      } text-xs`}
                                  >
                                    {link.isqrenabled ? t('links.status.qrEnabled') : t('links.status.qrDisabled')}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          <h3 className={`text-lg font-semibold mb-2 ${isDeleted ? 'text-red-700' : 'text-gray-900'
                            }`}>
                            {link.title || t('links.untitledLink')}
                          </h3>

                          <div className="space-y-2">
                            {/* Short URL */}
                            <div className={`p-3 rounded-md border ${isDeleted ? 'bg-red-100 border-red-200' : 'border-gray-200'
                              }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Image
                                  src="/favicon2.png"
                                  alt="URLINK"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4"
                                />
                                <p className={`text-xs ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>{t('links.shortUrl')}</p>
                              </div>
                              <p className={`font-mono text-sm ${isDeleted ? 'text-red-700' : 'text-[#5e17eb]'
                                } break-all overflow-wrap-break-word word-break-break-all`}>
                                {shortUrl}
                              </p>
                            </div>

                            {/* Original URL */}
                            <div>
                              <p className={`text-xs mb-1 ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>{t('links.originalUrl')}</p>
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
                              <span className={`text-xs ${isDeleted ? 'text-red-600' : 'text-gray-500'}`}>{t('links.clicks')}</span>
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
                                  <span className="text-green-600">{t('links.actions.restore')}</span>
                                </Button>
                                <span className="text-xs text-red-600">
                                  {t('links.deletedInfo', { date: format(new Date(link.deleted_at!), 'MMM dd, yyyy') })}
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
                                    <p className="text-gray-700">{isCopied ? t('links.actions.copied') : t('links.actions.copy')}</p>
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
                                    <p className="text-gray-700">{t('links.actions.edit')}</p>
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
                                      <p className="text-gray-700">{t('links.actions.showQR')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

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
                                    <p className="text-gray-700">{t('links.actions.open')}</p>
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
                                    <p className="text-gray-700">{link.is_active ? t('links.actions.deactivate') : t('links.actions.activate')}</p>
                                  </TooltipContent>
                                </Tooltip>

                                {/* Delete Button */}
                                <AlertDialog>
                                  <Tooltip>
                                    <AlertDialogTrigger asChild>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-gray-700 hover:bg-gray-200 hover:text-red-600 p-2 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                    </AlertDialogTrigger>
                                    <TooltipContent className="bg-white text-gray-700 border border-gray-200">
                                      <p className="text-gray-700">{t('links.actions.delete')}</p>
                                    </TooltipContent>
                                  </Tooltip>
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
                                        onClick={() => handleSoftDelete(link.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <span className="text-white">{t('dialogs.deleteLink.confirm')}</span>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('emptyStates.noResults.title')}</h3>
                  <p className="text-gray-500 mb-4">
                    {t('emptyStates.noResults.description')}
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="text-gray-700">{t('emptyStates.noResults.action')}</span>
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
                <h3 className="text-lg font-semibold text-gray-900">{t('qrCode.title')}</h3>
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
                    {selectedLinkForQR.title || t('qrCode.smartLink')}
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
                  <span className="text-white">{t('qrCode.download')}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Onboarding Overlay - only shows when no real links exist */}
        {showOnboardingOverlay && (
          <div className="absolute inset-0 bg-black/50 flex items-start justify-center z-40 p-4">
            <div className="relative w-full overflow-y-auto mt-4">
              <OnboardingProgress
                showAsOverlay={true}
                onDismiss={() => {
                  // Can't dismiss if no links created
                  toast.info(t('messages.onboardingDismissed'));
                }}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
