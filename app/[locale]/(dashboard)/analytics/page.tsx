"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfToday, isToday, parseISO } from 'date-fns';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, MousePointerClick, TrendingUp, Globe, RefreshCw } from 'lucide-react';
import { AnalyticsSummaryBox } from '@/components/analytics/AnalyticsSummaryBox';
import { ChartCard } from '@/components/analytics/ChartCard';
import { LineChart } from '@/components/analytics/LineChart';
import { EmptyAnalyticsState } from '@/components/analytics/EmptyAnalyticsState';
import { TopLinkCard } from '@/components/analytics/TopLinkCard';

// Updated types to match your database schema
export interface LinkClick {
  id: string;
  link_id: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  country_code: string | null;
  device_type: string;
  redirect_type: string;
}

export interface Link {
  id: string;
  title: string | null;
  original_url: string; // Updated to match your schema
  android_deeplink: string | null;
  ios_deeplink: string | null;
  platform: string;
  short_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  totalClicks: number;
  clicksToday: number;
  uniqueCountries: number;
  clicksByDay: { date: string; clicks: number; }[];
  deviceBreakdown: { device: string; count: number; }[];
  countryBreakdown: { country: string; count: number; }[];
  topLinks: {
    id: string;
    title: string;
    short_url: string;
    original_url: string;
    clicks: number;
    platform: string;
    avg_daily_clicks: number;
  }[];
}

export interface LinkWithClicks extends Link {
  click_count: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7');
  const [selectedLink, setSelectedLink] = useState('all');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real data instead of mock data
  useEffect(() => {
    if (user) {
      loadLinks();
      loadAnalytics();
    }
  }, [user, dateRange, selectedLink]);

  const loadLinks = async () => {
    if (!user) return;

    try {
      console.log('📋 Loading user links for analytics...');

      // Updated to match your actual schema
      const { data: linksData, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading links:', error);
        throw error;
      }

      setLinks(linksData || []);
      console.log('✅ Links loaded for analytics:', linksData?.length || 0);
    } catch (err) {
      console.error('Error loading links:', err);
      toast.error('Failed to load links', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('📊 Loading analytics data...');
      console.log('📅 Date range:', dateRange, 'days');
      console.log('🔗 Selected link:', selectedLink);

      const startDate = subDays(new Date(), parseInt(dateRange));
      const today = startOfToday();

      // Get user's links first
      const { data: userLinks, error: linksError } = await supabase
        .from('links')
        .select(`
          id, 
          title, 
          original_url, 
          platform,
          short_code
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('deleted_at', null);

      if (linksError) {
        console.error('❌ Error loading user links:', linksError);
        throw linksError;
      }

      if (!userLinks || userLinks.length === 0) {
        console.log('📝 No links found for user');
        setData({
          totalClicks: 0,
          clicksToday: 0,
          uniqueCountries: 0,
          clicksByDay: [],
          deviceBreakdown: [],
          countryBreakdown: [],
          topLinks: []
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Found', userLinks.length, 'links for analytics');

      const linkIds = userLinks.map(link => link.id);

      // Build query for clicks data
      let clicksQuery = supabase
        .from('link_clicks')
        .select(`
          id,
          link_id,
          clicked_at,
          ip_address,
          user_agent,
          referrer_url,
          country_code,
          device_type,
          redirect_type
        `)
        .in('link_id', linkIds)
        .gte('clicked_at', startDate.toISOString());

      // Filter by specific link if selected
      if (selectedLink !== 'all') {
        clicksQuery = clicksQuery.eq('link_id', selectedLink);
        console.log('🎯 Filtering by specific link:', selectedLink);
      }

      const { data: clicksData, error: clicksError } = await clicksQuery;

      if (clicksError) {
        console.error('❌ Error loading clicks data:', clicksError);
        throw clicksError;
      }

      const clicks = clicksData || [];
      console.log('📊 Found', clicks.length, 'clicks in date range');

      // Calculate metrics
      const totalClicks = clicks.length;
      const clicksToday = clicks.filter(click =>
        isToday(parseISO(click.clicked_at))
      ).length;

      const uniqueCountries = new Set(
        clicks
          .map(click => click.country_code)
          .filter(Boolean)
      ).size;

      console.log('📈 Calculated metrics:', {
        totalClicks,
        clicksToday,
        uniqueCountries
      });

      // Process clicks by day
      const clicksByDayMap = new Map<string, number>();

      // Initialize all days in range with 0 clicks
      for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'MMM dd');
        clicksByDayMap.set(dateKey, 0);
      }

      // Count actual clicks
      clicks.forEach(click => {
        const clickDate = parseISO(click.clicked_at);
        const dateKey = format(clickDate, 'MMM dd');
        if (clicksByDayMap.has(dateKey)) {
          clicksByDayMap.set(dateKey, (clicksByDayMap.get(dateKey) || 0) + 1);
        }
      });

      const clicksByDay = Array.from(clicksByDayMap.entries()).map(([date, clicks]) => ({
        date,
        clicks
      }));

      // Process device breakdown using device_type from your schema
      const deviceMap = new Map<string, number>();
      clicks.forEach(click => {
        const device = click.device_type || 'Unknown';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      });

      const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1), // Capitalize first letter
        count
      }));

      // Process country breakdown
      const countryMap = new Map<string, number>();
      clicks.forEach(click => {
        const country = click.country_code || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      });

      const countryBreakdown = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Process top links
      const linkClicksMap = new Map<string, number>();
      clicks.forEach(click => {
        linkClicksMap.set(click.link_id, (linkClicksMap.get(click.link_id) || 0) + 1);
      });

      const topLinks = userLinks
        .map(link => {
          const clickCount = linkClicksMap.get(link.id) || 0;
          // Updated to match your URL structure
          const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com'}/${link.platform}/${link.short_code}`;

          // Use platform from your enum
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

          return {
            id: link.id,
            title: link.title || `${getPlatformDisplay(link.platform)} Link`,
            short_url: shortUrl,
            original_url: link.original_url,
            clicks: clickCount,
            platform: getPlatformDisplay(link.platform),
            avg_daily_clicks: Math.round(clickCount / parseInt(dateRange))
          };
        })
        .filter(link => link.clicks > 0)
        .sort((a, b) => b.clicks - a.clicks);

      const analyticsData = {
        totalClicks,
        clicksToday,
        uniqueCountries,
        clicksByDay,
        deviceBreakdown,
        countryBreakdown,
        topLinks
      };

      setData(analyticsData);
      console.log('✅ Analytics data loaded successfully:', analyticsData);

    } catch (err) {
      console.error('💥 Error loading analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      toast.error('Failed to load analytics data', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      loadLinks();
      loadAnalytics();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-4 bg-red-50 border-red-200 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              className="mt-4 w-full sm:w-auto"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5e17eb]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.totalClicks === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EmptyAnalyticsState
            title="No analytics data yet"
            description="Start sharing your smart links to see click data and insights."
            actionText="Create your first link"
            onAction={() => window.location.href = '/create-link'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Analytics</h1>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px] text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] bg-gray-100 placeholder:text-gray-500 [&[data-placeholder]>span]:text-gray-500 [&>svg]:text-gray-600">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className='text-gray-700 bg-white'>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLink} onValueChange={setSelectedLink}>
            <SelectTrigger className="w-full sm:w-[240px] text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] bg-gray-100 placeholder:text-gray-500 [&[data-placeholder]>span]:text-gray-500 [&>svg]:text-gray-600">
              <SelectValue placeholder="Select link" />
            </SelectTrigger>
            <SelectContent className='text-gray-700 bg-white'>
              <SelectItem value="all">All Links</SelectItem>
              {links.map(link => (
                <SelectItem key={link.id} value={link.id}>
                  {link.title || `${link.platform}/${link.short_code}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnalyticsSummaryBox
            label="Total Clicks"
            value={data.totalClicks}
            icon={<MousePointerClick
              className="w-5 h-5"
              color={data.totalClicks > 0 ? 'green' : 'gray'}
            />}
          />
          <AnalyticsSummaryBox
            label="Clicks Today"
            value={data.clicksToday}
            icon={<TrendingUp className="w-5 h-5"
              color={data.clicksToday > 0 ? 'green' : 'gray'}
            />}
            variant={data.clicksToday > 0 ? 'success' : 'default'}
          />
          <AnalyticsSummaryBox
            label="Countries Reached"
            value={data.uniqueCountries}
            icon={<Globe className="w-5 h-5"
              color={data.uniqueCountries > 0 ? 'blue' : 'gray'}
            />}
          />
        </div>

        {/* Clicks Over Time Chart */}
        <ChartCard
          title="Clicks Over Time"
          subtitle={`Last ${dateRange} days`}
        >
          <LineChart data={data.clicksByDay} />
        </ChartCard>

        {/* Top Performing Link */}
        {data.topLinks[0] && (
          <TopLinkCard
            link={{
              shortUrl: data.topLinks[0].short_url,
              originalUrl: data.topLinks[0].original_url,
              totalClicks: data.topLinks[0].clicks,
              dailyAvg: data.topLinks[0].avg_daily_clicks,
              platform: data.topLinks[0].platform
            }}
            chartData={data.clicksByDay}
            onViewDetails={() => setSelectedLink(data.topLinks[0].id)}
          />
        )}

        {/* Device and Country Breakdown */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
            <div className="space-y-4">
              {data.deviceBreakdown.length > 0 ? (
                data.deviceBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.device}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No device data available</p>
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-4">
              {data.countryBreakdown.length > 0 ? (
                data.countryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.country}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No country data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
