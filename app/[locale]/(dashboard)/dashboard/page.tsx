"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertTriangle, Copy, Edit, Share2, ExternalLink, TrendingUp, MousePointerClick, Globe, Users, Play, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartCard } from '@/components/analytics/ChartCard';
import { BarChart } from '@/components/analytics/BarChart';
import { format, subDays, isToday, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Updated interface to match your database schema
interface SmartLink {
  id: string;
  title: string | null;
  original_url: string; // Updated to match your schema
  android_deeplink: string | null;
  ios_deeplink: string | null;
  platform: string;
  short_code: string;
  clicks: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    clicksToday: 0,
    totalLinks: 0,
    activeLinks: 0,
    clicksLast7Days: 0,
    clickPercentageChange: 0
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) {
      setError('Please log in to view your dashboard');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📊 Loading dashboard data for user:', user.id);

      // Load user's links with click counts
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
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10); // Show last 10 links on dashboard

      if (linksError) {
        throw linksError;
      }

      const userLinks = linksData || [];
      console.log('✅ Found', userLinks.length, 'links for dashboard');

      if (userLinks.length === 0) {
        setLinks([]);
        setIsLoading(false);
        return;
      }

      // Get click data for these links
      const linkIds = userLinks.map(link => link.id);

      // Get all clicks for user's links
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
        // Continue with 0 clicks rather than failing
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
        clickPercentageChange
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
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0
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
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0
      }));

      setDeviceData(deviceChartData);

      console.log('✅ Dashboard data loaded successfully');

    } catch (err) {
      console.error('💥 Error loading dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error('Failed to load dashboard data', {
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

  const handleEdit = (linkId: string) => {
    router.push(`/links/${linkId}/edit`);
  };

  const getPlatformIcon = (platform: string) => {
    // You can import actual platform icons here
    return <Globe className="w-4 h-4" />;
  };

  const barChartData = analyticsData.map(item => ({
    label: item.source,
    value: item.percentage
  }));

  const deviceChartData = deviceData.map(item => ({
    label: item.device,
    value: item.percentage
  }));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Button
          onClick={loadDashboardData}
          className="mt-4 text-red-600 hover:text-red-700"
          variant="outline"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      {links.length === 0 ? (
        <OnboardingProgress />
      ) : (
        <div className="p-4 md:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your smart links today.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalClicks.toLocaleString()}</p>
                </div>
                <MousePointerClick className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Clicks Today</p>
                  <p className="text-2xl font-bold text-green-900">{stats.clicksToday}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Links</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalLinks}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">7-Day Growth</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.clickPercentageChange > 0 ? '+' : ''}{stats.clickPercentageChange}%
                  </p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Recent Links Table */}
          <Card className="bg-gray-100 shadow-lg shadow-[#5e17eb]/20 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">Recent Smart Links</CardTitle>
              <Button
                onClick={() => router.push('/links')}
                variant="outline"
                size="sm"
                className="text-[#5e17eb] border-[#5e17eb] hover:bg-[#5e17eb] hover:text-white"
              >
                View All Links
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <Table>
                  <TableCaption className="text-sm text-white p-4 bg-[#5e17eb]/70 mt-0 hover:bg-[#5e17eb]/80">
                    Your most recently created smart links
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-[#5e17eb]/70 hover:bg-[#5e17eb]/80 transition-colors">
                      <TableHead className="text-white font-medium">Platform</TableHead>
                      <TableHead className="text-white font-medium">Short Link</TableHead>
                      <TableHead className="text-white font-medium">Destination</TableHead>
                      <TableHead className="text-white font-medium">Created</TableHead>
                      <TableHead className="text-white font-medium">Clicks</TableHead>
                      <TableHead className="text-white font-medium">Actions</TableHead>
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
                              <span className="capitalize">{link.platform.replace('-', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 font-medium">
                            <span className="text-[#5e17eb]">{shortUrl}</span>
                          </TableCell>
                          <TableCell className="text-gray-700 max-w-xs truncate">
                            {link.original_url}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {format(new Date(link.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-gray-700 font-semibold">
                            {link.clicks.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className={`p-2 transition-colors ${isCopied
                                      ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                                      : 'text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb]'
                                      }`}
                                    onClick={() => copyToClipboard(shortUrl, link.id)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                  <p className="text-gray-700">{isCopied ? 'Copied!' : 'Copy Link'}</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors"
                                    onClick={() => handleEdit(link.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                  <p className="text-gray-700">Edit Link</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors"
                                    onClick={() => handleShare(link)}
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                  <p className="text-gray-700">Share Link</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:bg-gray-200 hover:text-blue-600 p-2 transition-colors"
                                    onClick={() => window.open(shortUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                  <p className="text-gray-700">Open Link</p>
                                </TooltipContent>
                              </Tooltip>
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
              <Card className="bg-gray-100 shadow-lg shadow-[#5e17eb]/20 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800">Performance Analytics</CardTitle>
                  <Button
                    onClick={() => router.push('/analytics')}
                    variant="outline"
                    size="sm"
                    className="text-[#5e17eb] border-[#5e17eb] hover:bg-[#5e17eb] hover:text-white"
                  >
                    View Detailed Analytics
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analyticsData.length > 0 && (
                      <div className="w-full">
                        <Card className="bg-gray-50 shadow-md shadow-[#5e17eb]/10 rounded-lg">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-700">Clicks by Type</CardTitle>
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
                            <CardTitle className="text-base font-semibold text-gray-700">Clicks by Device</CardTitle>
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
                      <p className="text-gray-500">No analytics data available yet.</p>
                      <p className="text-sm text-gray-400 mt-1">Start sharing your links to see insights!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Video Tutorials Section */}
            <div className="xl:col-span-1">
              <Card className="bg-gray-100 shadow-lg shadow-[#5e17eb]/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Play className="w-5 h-5 text-[#5e17eb]" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50"
                      onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5e17eb]/10 rounded-lg">
                          <Play className="w-4 h-4 text-[#5e17eb]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Creating Your First Smart Link</p>
                          <p className="text-sm text-gray-500">Learn how to create deep links</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50"
                      onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5e17eb]/10 rounded-lg">
                          <BookOpen className="w-4 h-4 text-[#5e17eb]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Understanding Analytics</p>
                          <p className="text-sm text-gray-500">Track your link performance</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50"
                      onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5e17eb]/10 rounded-lg">
                          <Globe className="w-4 h-4 text-[#5e17eb]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Advanced Features</p>
                          <p className="text-sm text-gray-500">QR codes and customization</p>
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => router.push('/create-link')}
                      className="w-full bg-[#5e17eb] text-white hover:bg-[#4e13c4]"
                    >
                      Create New Smart Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
