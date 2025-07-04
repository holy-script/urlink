"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertTriangle, Copy, Edit, Share2, ExternalLink, TrendingUp, MousePointerClick, Globe, Users, Play, BookOpen, Shield, CheckCircle, RefreshCw, QrCode, Eye, EyeOff, Trash2, Download, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartCard } from '@/components/analytics/ChartCard';
import { BarChart } from '@/components/analytics/BarChart';
import { format, subDays, isToday, parseISO } from 'date-fns';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Updated interface to match your new database schema
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

interface AnalyticsData {
  source: string;
  percentage: number;
}

interface DeviceData {
  device: string;
  percentage: number;
}

interface DashboardStats {
  totalClicks: number;
  clicksToday: number;
  totalLinks: number;
  activeLinks: number;
  clicksLast7Days: number;
  clickPercentageChange: number;
  // New fields for email verification model
  lifetimeClicksUsed: number;
  isEmailVerified: boolean;
  clicksRemaining: number;
  hasActiveSubscription: boolean;
}

interface UserStatus {
  is_email_verified: boolean;
  name: string | null;
  avatar_url: string | null;
}

interface OnboardingSteps {
  createLink: boolean;
  setupBilling: boolean;
  customizeProfile: boolean;
}

// Custom hook for localStorage state
const useLocalStorageState = <T,>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }, [key, state]);

  return [state, setState];
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('Dashboard');

  const [links, setLinks] = useState<SmartLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingSteps>({
    createLink: false,
    setupBilling: false,
    customizeProfile: false,
  });

  // Use localStorage for overlay dismissed state
  const [onboardingDismissed, setOnboardingDismissed] = useLocalStorageState(
    `onboarding-dismissed-${user?.id || 'anonymous'}`,
    false
  );

  const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);
  const [showQROverlay, setShowQROverlay] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [selectedLinkForQR, setSelectedLinkForQR] = useState<SmartLink | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    clicksToday: 0,
    totalLinks: 0,
    activeLinks: 0,
    clicksLast7Days: 0,
    clickPercentageChange: 0,
    lifetimeClicksUsed: 0,
    isEmailVerified: false,
    clicksRemaining: 0,
    hasActiveSubscription: false
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Mock data for demonstration when onboarding not complete
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

  const getMockStats = (): DashboardStats => ({
    totalClicks: 246,
    clicksToday: 12,
    totalLinks: 3,
    activeLinks: 3,
    clicksLast7Days: 89,
    clickPercentageChange: 23,
    lifetimeClicksUsed: 246,
    isEmailVerified: true,
    clicksRemaining: 254,
    hasActiveSubscription: false
  });

  const getMockAnalyticsData = (): AnalyticsData[] => [
    { source: 'Android App', percentage: 45 },
    { source: 'iOS App', percentage: 35 },
    { source: 'Web Browser', percentage: 20 }
  ];

  const getMockDeviceData = (): DeviceData[] => [
    { device: 'Mobile', percentage: 65 },
    { device: 'Desktop', percentage: 25 },
    { device: 'Tablet', percentage: 10 }
  ];

  const loadDashboardData = async () => {
    if (!user) {
      setError(t('errors.loginRequired'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📊 Loading dashboard data for user:', user.id);

      // Load user status first - UPDATED to match your actual schema
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          is_email_verified,
          name,
          avatar_url
        `)
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('❌ Error loading user data:', userError);
        throw userError;
      }

      setUserStatus(userData);

      // Check for active subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('status, canceled_at')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

      const hasActiveSubscription = !!subscriptionData &&
        (subscriptionData.canceled_at === null || new Date(subscriptionData.canceled_at) > new Date());

      // Check if user has created any links - updated to include isqrenabled and deleted_at
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
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (linksError) {
        throw linksError;
      }

      const userLinks = linksData || [];
      console.log('✅ Found', userLinks.length, 'links for dashboard');

      // Calculate onboarding completion - UPDATED logic
      const hasCreatedLink = userLinks.length > 0;
      const hasBilling = hasActiveSubscription;
      const hasCompleteProfile = userData.is_email_verified &&
        userData.name &&
        userData.name.trim() !== '' &&
        userData.avatar_url;

      setOnboardingSteps({
        createLink: hasCreatedLink,
        setupBilling: hasBilling,
        customizeProfile: hasCompleteProfile,
      });

      // Show onboarding overlay if profile or billing is incomplete AND not dismissed
      const shouldShowOnboarding = (!hasCompleteProfile || !hasBilling) && !onboardingDismissed;

      if (shouldShowOnboarding) {
        console.log('🎯 Showing onboarding overlay - incomplete steps:', {
          hasCreatedLink,
          hasCompleteProfile,
          hasBilling,
          dismissed: onboardingDismissed
        });
        setShowOnboardingOverlay(true);

        // Use real data but still show overlay
        if (userLinks.length > 0) {
          // Load real data since user has links
          const linkIds = userLinks.map(link => link.id);

          const { data: clicksData, error: clicksError } = await supabase
            .from('link_clicks')
            .select(`
              id,
              link_id,
              clicked_at,
              device_type,
              redirect_type,
              referrer_url
            `)
            .in('link_id', linkIds);

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

          // Calculate real stats
          const totalClicks = clicks.length;
          const today = new Date();
          const clicksToday = clicks.filter(click =>
            isToday(parseISO(click.clicked_at))
          ).length;

          const last7Days = subDays(today, 7);
          const clicksLast7Days = clicks.filter(click =>
            parseISO(click.clicked_at) >= last7Days
          ).length;

          const previous7Days = subDays(today, 14);
          const clicksPrevious7Days = clicks.filter(click =>
            parseISO(click.clicked_at) >= previous7Days && parseISO(click.clicked_at) < last7Days
          ).length;

          const clickPercentageChange = clicksPrevious7Days > 0
            ? Math.round(((clicksLast7Days - clicksPrevious7Days) / clicksPrevious7Days) * 100)
            : clicksLast7Days > 0 ? 100 : 0;

          setStats({
            totalClicks,
            clicksToday,
            totalLinks: userLinks.length,
            activeLinks: userLinks.filter(link => link.is_active).length,
            clicksLast7Days,
            clickPercentageChange,
            lifetimeClicksUsed: totalClicks,
            isEmailVerified: userData.is_email_verified,
            clicksRemaining: Math.max(0, 1000 - totalClicks),
            hasActiveSubscription
          });

          // Process analytics data for charts
          const redirectTypeMap = new Map<string, number>();
          clicks.forEach(click => {
            const type = click.redirect_type || 'web_fallback';
            const label = type === 'android_deeplink' ? 'Android App' :
              type === 'ios_deeplink' ? 'iOS App' : 'Web Browser';
            redirectTypeMap.set(label, (redirectTypeMap.get(label) || 0) + 1);
          });

          const analyticsChartData: AnalyticsData[] = Array.from(redirectTypeMap.entries()).map(([source, count]) => ({
            source,
            percentage: clicks.length > 0 ? Math.round((count / clicks.length) * 100) : 0
          }));

          setAnalyticsData(analyticsChartData);

          // Process device data
          const deviceMap = new Map<string, number>();
          clicks.forEach(click => {
            const device = click.device_type || 'Unknown';
            const deviceLabel = device.charAt(0).toUpperCase() + device.slice(1);
            deviceMap.set(deviceLabel, (deviceMap.get(deviceLabel) || 0) + 1);
          });

          const deviceChartData: DeviceData[] = Array.from(deviceMap.entries()).map(([device, count]) => ({
            device,
            percentage: clicks.length > 0 ? Math.round((count / clicks.length) * 100) : 0
          }));

          setDeviceData(deviceChartData);
        } else {
          // Use mock data if no links
          setLinks(getMockLinks());
          setStats(getMockStats());
          setAnalyticsData(getMockAnalyticsData());
          setDeviceData(getMockDeviceData());
        }

        setIsLoading(false);
        return;
      }

      // If onboarding is complete or dismissed, load real data normally
      if (userLinks.length === 0) {
        setLinks([]);
        setStats({
          totalClicks: 0,
          clicksToday: 0,
          totalLinks: 0,
          activeLinks: 0,
          clicksLast7Days: 0,
          clickPercentageChange: 0,
          lifetimeClicksUsed: 0,
          isEmailVerified: userData.is_email_verified,
          clicksRemaining: 1000,
          hasActiveSubscription
        });
        setAnalyticsData([]);
        setDeviceData([]);
        setIsLoading(false);
        return;
      }

      // Load real data for completed onboarding
      const linkIds = userLinks.map(link => link.id);

      const { data: clicksData, error: clicksError } = await supabase
        .from('link_clicks')
        .select(`
          id,
          link_id,
          clicked_at,
          device_type,
          redirect_type,
          referrer_url
        `)
        .in('link_id', linkIds);

      if (clicksError) {
        console.warn('Error fetching clicks:', clicksError);
      }

      const clicks = clicksData || [];
      console.log('📊 Found', clicks.length, 'total clicks for dashboard');

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

      // Calculate dashboard statistics
      const totalClicks = clicks.length;
      const today = new Date();
      const clicksToday = clicks.filter(click =>
        isToday(parseISO(click.clicked_at))
      ).length;

      const last7Days = subDays(today, 7);
      const clicksLast7Days = clicks.filter(click =>
        parseISO(click.clicked_at) >= last7Days
      ).length;

      const previous7Days = subDays(today, 14);
      const clicksPrevious7Days = clicks.filter(click =>
        parseISO(click.clicked_at) >= previous7Days && parseISO(click.clicked_at) < last7Days
      ).length;

      const clickPercentageChange = clicksPrevious7Days > 0
        ? Math.round(((clicksLast7Days - clicksPrevious7Days) / clicksPrevious7Days) * 100)
        : clicksLast7Days > 0 ? 100 : 0;

      setStats({
        totalClicks,
        clicksToday,
        totalLinks: userLinks.length,
        activeLinks: userLinks.filter(link => link.is_active).length,
        clicksLast7Days,
        clickPercentageChange,
        lifetimeClicksUsed: totalClicks,
        isEmailVerified: userData.is_email_verified,
        clicksRemaining: Math.max(0, 1000 - totalClicks),
        hasActiveSubscription
      });

      // Process analytics data for charts
      const redirectTypeMap = new Map<string, number>();
      clicks.forEach(click => {
        const type = click.redirect_type || 'web_fallback';
        const label = type === 'android_deeplink' ? 'Android App' :
          type === 'ios_deeplink' ? 'iOS App' : 'Web Browser';
        redirectTypeMap.set(label, (redirectTypeMap.get(label) || 0) + 1);
      });

      const analyticsChartData: AnalyticsData[] = Array.from(redirectTypeMap.entries()).map(([source, count]) => ({
        source,
        percentage: clicks.length > 0 ? Math.round((count / clicks.length) * 100) : 0
      }));

      setAnalyticsData(analyticsChartData);

      // Process device data
      const deviceMap = new Map<string, number>();
      clicks.forEach(click => {
        const device = click.device_type || 'Unknown';
        const deviceLabel = device.charAt(0).toUpperCase() + device.slice(1);
        deviceMap.set(deviceLabel, (deviceMap.get(deviceLabel) || 0) + 1);
      });

      const deviceChartData: DeviceData[] = Array.from(deviceMap.entries()).map(([device, count]) => ({
        device,
        percentage: clicks.length > 0 ? Math.round((count / clicks.length) * 100) : 0
      }));

      setDeviceData(deviceChartData);

      console.log('✅ Dashboard data loaded successfully');

    } catch (err) {
      console.error('💥 Error loading dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : t('messages.dashboardLoadFailed');
      setError(errorMessage);
      toast.error(t('messages.dashboardLoadFailed'), {
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
        title: link.title || t('qrCode.smartLink'),
        url: shortUrl
      });
    } else {
      copyToClipboard(shortUrl, link.id);
    }
  };

  const handleEdit = (shortCode: string) => {
    if (shortCode.startsWith('demo')) {
      toast.info(t('links.demo.message'));
      router.push('/create-link');
      return;
    }
    router.push(`/edit-link/${shortCode}`);
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    if (linkId.startsWith('mock-')) {
      toast.info(t('links.demo.message'));
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

      const status = !currentStatus ? 'activated' : 'deactivated';
      toast.success(t('messages.linkActivated', { status }));
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error(t('messages.linkUpdateFailed'));
    }
  };

  const handleSoftDelete = async (linkId: string) => {
    if (linkId.startsWith('mock-')) {
      toast.info(t('links.demo.message'));
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
        prevLinks.filter(link => link.id !== linkId)
      );

      toast.success(t('messages.linkDeleted'));
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error(t('messages.linkDeleteFailed'));
    }
  };

  const handleShowQR = (link: SmartLink) => {
    if (link.id.startsWith('mock-')) {
      toast.info(t('links.demo.message'));
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

  const handleDismissOnboarding = () => {
    setOnboardingDismissed(true);
    setShowOnboardingOverlay(false);
    toast.success(t('onboarding.dismissed'));
  };

  const handleVideoTutorial = (videoUrl: string, title: string) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(title);
    setShowVideoOverlay(true);
  };

  // Platform SVG Icons
  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "w-4 h-4", fill: "currentColor" };

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
        return <Globe className="w-4 h-4 text-gray-700" />;
    }
  };

  const barChartData = analyticsData.map(item => ({
    label: item.source,
    value: item.percentage
  }));

  const deviceChartData = deviceData.map(item => ({
    label: item.device,
    value: item.percentage
  }));

  // Helper function to get status message based on new model
  const getStatusMessage = () => {
    if (!stats.isEmailVerified) {
      return {
        type: 'warning' as const,
        message: t('status.emailVerificationRequired'),
        action: t('status.verifyEmail'),
        actionUrl: '/account'
      };
    }

    if (stats.clicksRemaining === 0 && !stats.hasActiveSubscription) {
      return {
        type: 'error' as const,
        message: t('status.allClicksUsed'),
        action: t('status.viewPlans'),
        actionUrl: '/billing'
      };
    }

    if (stats.clicksRemaining <= 50 && !stats.hasActiveSubscription) {
      return {
        type: 'warning' as const,
        message: t('status.freeClicksRemaining', { remaining: stats.clicksRemaining }),
        action: t('status.viewPlans'),
        actionUrl: '/billing'
      };
    }

    return null;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">{t('errors.loadingTitle')}</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Button
          onClick={loadDashboardData}
          className="mt-4 text-red-600 hover:text-red-700 bg-white border border-red-300 hover:bg-red-50"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2 text-red-600" />
          <span className="text-red-600">{t('errors.tryAgain')}</span>
        </Button>
      </Card>
    );
  }

  // Show onboarding if no links created (original behavior)
  if (links.length === 0 && !showOnboardingOverlay) {
    return <OnboardingProgress />;
  }

  const statusMessage = getStatusMessage();

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Main Dashboard Content */}
        <div className={`p-4 md:p-6 space-y-6 ${showOnboardingOverlay ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Welcome Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className='flex items-center gap-4'>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('welcome.title')}
                  </h1>
                  <p className="text-gray-600">
                    {showOnboardingOverlay
                      ? t('welcome.subtitleOnboarding')
                      : t('welcome.subtitle')
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={loadDashboardData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4 text-gray-700" />
                <span className="text-gray-700">{t('actions.refresh')}</span>
              </Button>
            </div>
          </div>

          {/* Demo Banner */}
          {showOnboardingOverlay && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-800">{t('onboarding.banner.title')}</h3>
                  <p className="text-purple-600 text-sm">{t('onboarding.banner.description')}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Status Alert */}
          {statusMessage && !showOnboardingOverlay && (
            <Card className={`p-4 border-2 ${statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusMessage.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Shield className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`font-medium ${statusMessage.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                    {statusMessage.message}
                  </span>
                </div>
                <Button
                  onClick={() => router.push(statusMessage.actionUrl)}
                  size="sm"
                  className={
                    statusMessage.type === 'error'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }
                >
                  <span className="text-white">{statusMessage.action}</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">{t('stats.totalClicks')}</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalClicks.toLocaleString()}</p>
                </div>
                <MousePointerClick className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">{t('stats.clicksToday')}</p>
                  <p className="text-2xl font-bold text-green-900">{stats.clicksToday}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">{t('stats.totalLinks')}</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalLinks}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className={`p-4 bg-gradient-to-r ${stats.isEmailVerified ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stats.isEmailVerified ? 'text-emerald-600' : 'text-orange-600'}`}>{t('stats.accountStatus')}</p>
                  <p className={`text-lg font-bold ${stats.hasActiveSubscription ? 'text-emerald-900' : stats.isEmailVerified ? 'text-emerald-900' : 'text-orange-900'}`}>
                    {stats.hasActiveSubscription ? t('stats.subscribed') :
                      stats.isEmailVerified ? t('stats.verified') : t('stats.unverified')}
                  </p>
                </div>
                <Users className={`w-8 h-8 ${stats.isEmailVerified ? 'text-emerald-500' : 'text-orange-500'}`} />
              </div>
            </Card>
          </div>

          {/* Recent Links Table */}
          <Card className="bg-white shadow-lg shadow-[#5e17eb]/20 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">{t('links.title')}</CardTitle>
              <Button
                onClick={() => router.push('/my-links')}
                variant="outline"
                size="sm"
                className="bg-white text-[#5e17eb] border-[#5e17eb] hover:bg-[#5e17eb] hover:text-white"
              >
                <span className="text-[#5e17eb] hover:text-white">{t('actions.viewAllLinks')}</span>
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <Table>
                  <TableCaption className="text-sm text-white p-4 bg-[#5e17eb]/70 mt-0 hover:bg-[#5e17eb]/80">
                    {t('links.caption')}
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-[#5e17eb]/70 hover:bg-[#5e17eb]/80 transition-colors">
                      <TableHead className="text-white font-medium">{t('links.headers.platform')}</TableHead>
                      <TableHead className="text-white font-medium">{t('links.headers.shortLink')}</TableHead>
                      <TableHead className="text-white font-medium">{t('links.headers.destination')}</TableHead>
                      <TableHead className="text-white font-medium">{t('links.headers.created')}</TableHead>
                      <TableHead className="text-white font-medium">{t('links.headers.clicks')}</TableHead>
                      <TableHead className="text-white font-medium">{t('links.headers.status')}</TableHead>
                      <TableHead className="text-white font-medium">{t('links.headers.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link: SmartLink) => {
                      const shortUrl = getShortUrl(link.platform, link.short_code);
                      const isCopied = copiedLinkId === link.id;

                      return (
                        <TableRow key={link.id} className="bg-gray-50 hover:bg-white transition-colors">
                          <TableCell className="text-gray-700 font-medium">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(link.platform)}
                              <span className="capitalize text-gray-900">{link.platform.replace('-', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 font-medium">
                            <div className="flex items-center gap-2">
                              <Image
                                src="/favicon2.png"
                                alt="URLINK"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                              <span className="text-[#5e17eb] font-mono text-sm">{shortUrl}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 max-w-xs truncate">
                            {link.title || link.original_url}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {format(new Date(link.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-gray-700 font-semibold">
                            {link.clicks.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${link.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {link.is_active ? t('links.status.active') : t('links.status.inactive')}
                              </span>
                              {link.isqrenabled && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  QR
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
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
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2 border border-gray-200'>
                                  <p className="text-gray-700">{isCopied ? t('links.tooltips.copied') : t('links.tooltips.copyLink')}</p>
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
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2 border border-gray-200'>
                                  <p className="text-gray-700">{t('links.tooltips.editLink')}</p>
                                </TooltipContent>
                              </Tooltip>

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
                                  <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2 border border-gray-200'>
                                    <p className="text-gray-700">{t('links.tooltips.showQRCode')}</p>
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
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2 border border-gray-200'>
                                  <p className="text-gray-700">{t('links.tooltips.openLink')}</p>
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
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2 border border-gray-200'>
                                  <p className="text-gray-700">{link.is_active ? t('links.tooltips.deactivate') : t('links.tooltips.activate')}</p>
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
                                    <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2 border border-gray-200'>
                                      <p className="text-gray-700">{t('links.tooltips.deleteLink')}</p>
                                    </TooltipContent>
                                  </Tooltip>
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
                                      onClick={() => handleSoftDelete(link.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      <span className="text-white">{t('dialogs.deleteLink.confirm')}</span>
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Analytics and Video Tutorials Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Analytics Section */}
            <div className="xl:col-span-2">
              <Card className="bg-white shadow-lg shadow-[#5e17eb]/20 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800">{t('analytics.title')}</CardTitle>
                  <Button
                    onClick={() => router.push('/analytics')}
                    variant="outline"
                    size="sm"
                    className="bg-white text-[#5e17eb] border-[#5e17eb] hover:bg-[#5e17eb] hover:text-white"
                  >
                    <span className="text-[#5e17eb] hover:text-white">{t('actions.viewDetailedAnalytics')}</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analyticsData.length > 0 && (
                      <div className="w-full">
                        <Card className="bg-gray-50 shadow-md shadow-[#5e17eb]/10 rounded-lg">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-700">{t('analytics.clicksByType')}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="w-full h-64 p-2">
                              <BarChart data={barChartData} color="#5e17eb" isHorizontal={true} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {deviceData.length > 0 && (
                      <div className="w-full">
                        <Card className="bg-gray-50 shadow-md shadow-[#5e17eb]/10 rounded-lg">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-700">{t('analytics.clicksByDevice')}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="w-full h-64 p-2">
                              <BarChart data={deviceChartData} color="#5e17eb" isHorizontal={false} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>

                  {analyticsData.length === 0 && deviceData.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t('analytics.noData')}</p>
                      <p className="text-sm text-gray-400 mt-1">{t('analytics.noDataSubtext')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Video Tutorials Section */}
            <div className="xl:col-span-1 mb-8 xl:mb-0 h-full">
              <Card className="bg-white shadow-lg shadow-[#5e17eb]/20 rounded-xl h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Play className="w-5 h-5 text-[#5e17eb]" />
                    {t('gettingStarted.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => handleVideoTutorial('https://www.youtube.com/embed/dQw4w9WgXcQ', t('gettingStarted.tutorials.createLink.title'))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5e17eb]/10 rounded-lg">
                          <Play className="w-4 h-4 text-[#5e17eb]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{t('gettingStarted.tutorials.createLink.title')}</p>
                          <p className="text-sm text-gray-500">{t('gettingStarted.tutorials.createLink.description')}</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => handleVideoTutorial('https://www.youtube.com/embed/dQw4w9WgXcQ', t('gettingStarted.tutorials.analytics.title'))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5e17eb]/10 rounded-lg">
                          <BookOpen className="w-4 h-4 text-[#5e17eb]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{t('gettingStarted.tutorials.analytics.title')}</p>
                          <p className="text-sm text-gray-500">{t('gettingStarted.tutorials.analytics.description')}</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => handleVideoTutorial('https://www.youtube.com/embed/dQw4w9WgXcQ', t('gettingStarted.tutorials.advanced.title'))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5e17eb]/10 rounded-lg">
                          <Globe className="w-4 h-4 text-[#5e17eb]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{t('gettingStarted.tutorials.advanced.title')}</p>
                          <p className="text-sm text-gray-500">{t('gettingStarted.tutorials.advanced.description')}</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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

        {/* Onboarding Overlay - positioned over dashboard content only with proper z-index */}
        {showOnboardingOverlay && (
          <div className="absolute inset-0 bg-black/50 flex items-start justify-center z-40 p-4">
            <div className="relative w-full max-w-2xl md:mt-20 mt-4 overflow-y-auto">
              <OnboardingProgress
                showAsOverlay={true}
                onDismiss={() => {
                  setOnboardingDismissed(true);
                  setShowOnboardingOverlay(false);
                  toast.success(t('onboarding.dismissed'));
                }}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
