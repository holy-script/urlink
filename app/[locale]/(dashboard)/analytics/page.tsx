"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfToday, isToday, parseISO } from 'date-fns';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, MousePointerClick, TrendingUp, Globe, RefreshCw, Play } from 'lucide-react';
import { AnalyticsSummaryBox } from '@/components/analytics/AnalyticsSummaryBox';
import { ChartCard } from '@/components/analytics/ChartCard';
import { LineChart } from '@/components/analytics/LineChart';
import { EmptyAnalyticsState } from '@/components/analytics/EmptyAnalyticsState';
import { TopLinkCard } from '@/components/analytics/TopLinkCard';
import { useTranslations } from 'next-intl';

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
  original_url: string;
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
  const t = useTranslations('Analytics');

  // CHANGE 1: Default to 'all' instead of '7'
  const [dateRange, setDateRange] = useState('all');
  const [selectedLink, setSelectedLink] = useState('all');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CHANGE 2: Add state to track if we should show overlay
  const [showNoDataOverlay, setShowNoDataOverlay] = useState(false);

  // Mock data functions (similar to Dashboard)
  const getMockAnalyticsData = (): AnalyticsData => ({
    totalClicks: 342,
    clicksToday: 18,
    uniqueCountries: 12,
    clicksByDay: [
      { date: 'Dec 25', clicks: 45 },
      { date: 'Dec 26', clicks: 52 },
      { date: 'Dec 27', clicks: 38 },
      { date: 'Dec 28', clicks: 61 },
      { date: 'Dec 29', clicks: 47 },
      { date: 'Dec 30', clicks: 55 },
      { date: 'Dec 31', clicks: 44 }
    ],
    deviceBreakdown: [
      { device: 'Mobile', count: 198 },
      { device: 'Desktop', count: 102 },
      { device: 'Tablet', count: 42 }
    ],
    countryBreakdown: [
      { country: 'US', count: 156 },
      { country: 'CA', count: 78 },
      { country: 'UK', count: 45 },
      { country: 'DE', count: 34 },
      { country: 'FR', count: 29 }
    ],
    topLinks: [
      {
        id: 'demo-1',
        title: 'Instagram Post Demo',
        short_url: 'https://smarturlink.com/instagram/demo1',
        original_url: 'https://instagram.com/p/ABC123',
        clicks: 156,
        platform: 'Instagram',
        avg_daily_clicks: 22
      },
      {
        id: 'demo-2',
        title: 'YouTube Video Demo',
        short_url: 'https://smarturlink.com/youtube/demo2',
        original_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        clicks: 123,
        platform: 'YouTube',
        avg_daily_clicks: 18
      }
    ]
  });

  const getMockLinks = (): Link[] => [
    {
      id: 'demo-1',
      title: 'Instagram Post Demo',
      original_url: 'https://instagram.com/p/ABC123',
      android_deeplink: 'intent://instagram.com/p/ABC123/#Intent;package=com.instagram.android;scheme=https;end',
      ios_deeplink: 'instagram://media?id=ABC123',
      platform: 'instagram',
      short_code: 'demo1',
      is_active: true,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: 'YouTube Video Demo',
      original_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      android_deeplink: 'vnd.youtube:dQw4w9WgXcQ',
      ios_deeplink: 'youtube://dQw4w9WgXcQ',
      platform: 'youtube',
      short_code: 'demo2',
      is_active: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

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
      console.log(t('messages.loadingLinks'));

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
      console.log(t('messages.linksLoaded', { count: linksData?.length || 0 }));
    } catch (err) {
      console.error('Error loading links:', err);
      toast.error(t('errors.linksFailed'), {
        description: err instanceof Error ? err.message : t('errors.unknownError')
      });
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log(t('messages.loadingData'));
      console.log(t('messages.dateRange', { days: dateRange }));
      console.log(t('messages.selectedLink', { link: selectedLink }));

      // CHANGE 1: Handle 'all' date range
      let startDate: Date;
      if (dateRange === 'all') {
        // Set to a very old date to get all data
        startDate = new Date('2020-01-01');
      } else {
        startDate = subDays(new Date(), parseInt(dateRange));
      }
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
        console.log(t('messages.noLinksFound'));

        // CHANGE 2: Show overlay with mock data if no links
        setShowNoDataOverlay(true);
        setData(getMockAnalyticsData());
        setLinks(getMockLinks());
        setIsLoading(false);
        return;
      }

      console.log(t('messages.foundLinks', { count: userLinks.length }));

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
        .in('link_id', linkIds);

      // CHANGE 1: Only add date filter if not 'all'
      if (dateRange !== 'all') {
        clicksQuery = clicksQuery.gte('clicked_at', startDate.toISOString());
      }

      // Filter by specific link if selected
      if (selectedLink !== 'all') {
        clicksQuery = clicksQuery.eq('link_id', selectedLink);
        console.log(t('messages.filteringByLink', { linkId: selectedLink }));
      }

      const { data: clicksData, error: clicksError } = await clicksQuery;

      if (clicksError) {
        console.error('❌ Error loading clicks data:', clicksError);
        throw clicksError;
      }

      const clicks = clicksData || [];
      console.log(t('messages.foundClicks', { count: clicks.length }));

      // CHANGE 2: Show overlay with mock data if no clicks
      if (clicks.length === 0) {
        setShowNoDataOverlay(true);
        setData(getMockAnalyticsData());
        setLinks(getMockLinks());
        setIsLoading(false);
        return;
      }

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

      console.log(t('messages.calculatedMetrics'), {
        totalClicks,
        clicksToday,
        uniqueCountries
      });

      // Process clicks by day
      const clicksByDayMap = new Map<string, number>();

      // CHANGE 1: Handle 'all' date range for chart data
      let daysToShow = dateRange === 'all' ? 30 : parseInt(dateRange); // Show last 30 days for 'all'

      // Initialize all days in range with 0 clicks
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'MMM dd');
        clicksByDayMap.set(dateKey, 0);
      }

      // Count actual clicks (only for the chart display period)
      const chartStartDate = subDays(new Date(), daysToShow);
      clicks
        .filter(click => parseISO(click.clicked_at) >= chartStartDate)
        .forEach(click => {
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
        device: device.charAt(0).toUpperCase() + device.slice(1),
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
          const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com'}/${link.platform}/${link.short_code}`;

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

          return {
            id: link.id,
            title: link.title || `${getPlatformDisplay(link.platform)} Link`,
            short_url: shortUrl,
            original_url: link.original_url,
            clicks: clickCount,
            platform: getPlatformDisplay(link.platform),
            avg_daily_clicks: Math.round(clickCount / (dateRange === 'all' ? 30 : parseInt(dateRange)))
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
      setShowNoDataOverlay(false); // Hide overlay when we have real data
      console.log(t('messages.dataLoadedSuccess'), analyticsData);

    } catch (err) {
      console.error('💥 Error loading analytics:', err);
      const errorMessage = err instanceof Error ? err.message : t('errors.loadFailed');
      setError(errorMessage);
      toast.error(t('errors.loadFailed'), {
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
                <h3 className="font-medium text-red-800">{t('errors.loadingTitle')}</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              className="mt-4 w-full sm:w-auto"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('errors.tryAgain')}
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

  // Don't show empty state anymore - always show the main analytics with overlay if needed
  return (
    <div className="relative">
      {/* CHANGE 2: Main content with conditional blur */}
      <div className={`min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 ${showNoDataOverlay ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="mx-auto w-full space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('header.title')}</h1>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('header.refresh')}
            </Button>
          </div>

          {/* CHANGE 2: Demo Banner */}
          {showNoDataOverlay && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-800">Analytics Preview</h3>
                  <p className="text-purple-600 text-sm">This is how your analytics will look with real data!</p>
                </div>
              </div>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[180px] text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] bg-gray-100 placeholder:text-gray-500 [&[data-placeholder]>span]:text-gray-500 [&>svg]:text-gray-600">
                <SelectValue placeholder={t('filters.timeframe.placeholder')} />
              </SelectTrigger>
              <SelectContent className='text-gray-700 bg-white'>
                {/* CHANGE 1: All Time as first option, 7 days moved to second */}
                <SelectItem value="all">{t('filters.timeframe.allTime') || 'All Time'}</SelectItem>
                <SelectItem value="7">{t('filters.timeframe.last7Days')}</SelectItem>
                <SelectItem value="30">{t('filters.timeframe.last30Days')}</SelectItem>
                <SelectItem value="90">{t('filters.timeframe.last90Days')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLink} onValueChange={setSelectedLink}>
              <SelectTrigger className="w-full sm:w-[240px] text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-2 focus:ring-[#5e17eb] bg-gray-100 placeholder:text-gray-500 [&[data-placeholder]>span]:text-gray-500 [&>svg]:text-gray-600">
                <SelectValue placeholder={t('filters.links.placeholder')} />
              </SelectTrigger>
              <SelectContent className='text-gray-700 bg-white'>
                <SelectItem value="all">{t('filters.links.allLinks')}</SelectItem>
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
              label={t('summaryCards.totalClicks')}
              value={data?.totalClicks || 0}
              icon={<MousePointerClick
                className="w-5 h-5"
                color={(data?.totalClicks || 0) > 0 ? 'green' : 'gray'}
              />}
            />
            <AnalyticsSummaryBox
              label={t('summaryCards.clicksToday')}
              value={data?.clicksToday || 0}
              icon={<TrendingUp className="w-5 h-5"
                color={(data?.clicksToday || 0) > 0 ? 'green' : 'gray'}
              />}
              variant={(data?.clicksToday || 0) > 0 ? 'success' : 'default'}
            />
            <AnalyticsSummaryBox
              label={t('summaryCards.countriesReached')}
              value={data?.uniqueCountries || 0}
              icon={<Globe className="w-5 h-5"
                color={(data?.uniqueCountries || 0) > 0 ? 'blue' : 'gray'}
              />}
            />
          </div>

          {/* Clicks Over Time Chart */}
          {data && (
            <ChartCard
              title={t('charts.clicksOverTime.title')}
              subtitle={dateRange === 'all'
                ? t('charts.clicksOverTime.subtitleAllTime') || 'All time data (showing last 30 days)'
                : t('charts.clicksOverTime.subtitle', { dateRange })
              }
            >
              <LineChart data={data.clicksByDay} />
            </ChartCard>
          )}

          {/* Top Performing Link */}
          {data?.topLinks[0] && (
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
          {data && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('breakdown.deviceBreakdown.title')}</h3>
                <div className="space-y-4">
                  {data.deviceBreakdown.length > 0 ? (
                    data.deviceBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-600">{item.device}</span>
                        <span className="font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t('breakdown.deviceBreakdown.noData')}</p>
                  )}
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('breakdown.topCountries.title')}</h3>
                <div className="space-y-4">
                  {data.countryBreakdown.length > 0 ? (
                    data.countryBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-600">{item.country}</span>
                        <span className="font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t('breakdown.topCountries.noData')}</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* CHANGE 2: No Data Overlay using EmptyAnalyticsState */}
      {showNoDataOverlay && (
        <div className="absolute inset-0 bg-black/50 flex items-start justify-center z-40 p-4 pt-8">
          <div className="w-full max-w-2xl">
            <EmptyAnalyticsState
              title={t('emptyState.title')}
              description={t('emptyState.description')}
              actionText={t('emptyState.actionText')}
              onAction={() => window.location.href = '/create-link'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
