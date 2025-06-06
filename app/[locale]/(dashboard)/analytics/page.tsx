"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { format, subDays, startOfToday, endOfToday } from 'date-fns';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../lib/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, MousePointerClick, TrendingUp, Globe } from 'lucide-react';
import { AnalyticsSummaryBox } from '@/components/analytics/AnalyticsSummaryBox';
import { ChartCard } from '@/components/analytics/ChartCard';
import { LineChart } from '@/components/analytics/LineChart';
import { EmptyAnalyticsState } from '@/components/analytics/EmptyAnalyticsState';
import { TopLinkCard } from '@/components/analytics/TopLinkCard';

interface AnalyticsData {
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

export default function Analytics() {
  // const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7');
  const [selectedLink, setSelectedLink] = useState('all');
  const [data, setData] = useState<AnalyticsData | null>({
    totalClicks: 0,
    clicksToday: 0,
    uniqueCountries: 0,
    clicksByDay: [],
    deviceBreakdown: [],
    countryBreakdown: [],
    topLinks: []
  });
  const [links, setLinks] = useState<{ id: string; title: string; short_url: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData({
      totalClicks: 1000,
      clicksToday: 50,
      uniqueCountries: 10,
      clicksByDay: [
        { date: 'Oct 01', clicks: 100 },
        { date: 'Oct 02', clicks: 120 },
        { date: 'Oct 03', clicks: 80 },
        { date: 'Oct 04', clicks: 90 },
        { date: 'Oct 05', clicks: 110 },
        { date: 'Oct 06', clicks: 130 },
        { date: 'Oct 07', clicks: 150 }
      ],
      deviceBreakdown: [
        { device: 'Mobile', count: 600 },
        { device: 'Desktop', count: 300 },
        { device: 'Tablet', count: 100 }
      ],
      countryBreakdown: [
        { country: 'USA', count: 400 },
        { country: 'Canada', count: 200 },
        { country: 'UK', count: 150 },
        { country: 'Germany', count: 100 },
        { country: 'France', count: 50 }
      ],
      topLinks: [
        {
          id: '1',
          title: 'Link A',
          short_url: 'short.ly/a',
          original_url: 'https://example.com/a',
          clicks: 500,
          platform: 'Web',
          avg_daily_clicks: 70
        }
      ]
    });
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     loadLinks();
  //     loadAnalytics();
  //   }
  // }, [user, dateRange, selectedLink]);

  // const loadLinks = async () => {
  //   try {
  //     const { data: linksData, error } = await supabase
  //       .from('smart_links')
  //       .select('id, title, short_url')
  //       .eq('user_id', user?.id)
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;
  //     setLinks(linksData || []);
  //   } catch (err) {
  //     console.error('Error loading links:', err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to load links",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const loadAnalytics = async () => {
    //   try {
    //     const startDate = subDays(new Date(), parseInt(dateRange));

    //     // Build query based on selected link
    //     let query = supabase
    //       .from('link_clicks')
    //       .select(`
    //         id,
    //         timestamp,
    //         device_type,
    //         country,
    //         smart_links!inner(
    //           id,
    //           title,
    //           short_url,
    //           original_url,
    //           platform,
    //           clicks
    //         )
    //       `)
    //       .gte('timestamp', startDate.toISOString());

    //     if (selectedLink !== 'all') {
    //       query = query.eq('link_id', selectedLink);
    //     }

    //     const { data: clicksData, error } = await query;

    //     if (error) throw error;

    //     // Get today's clicks
    //     const today = startOfToday();
    //     const clicksToday = clicksData.filter(click =>
    //       new Date(click.timestamp) >= today
    //     ).length;

    //     // Get unique countries
    //     const uniqueCountries = new Set(
    //       clicksData
    //         .map(click => click.country)
    //         .filter(Boolean)
    //     ).size;

    //     // Process clicks by day
    //     const clicksByDay = Object.entries(
    //       clicksData.reduce((acc: any, click) => {
    //         const day = format(new Date(click.timestamp), 'MMM dd');
    //         acc[day] = (acc[day] || 0) + 1;
    //         return acc;
    //       }, {})
    //     ).map(([date, clicks]) => ({ date, clicks: clicks as number }));

    //     // Process device breakdown
    //     const deviceBreakdown = Object.entries(
    //       clicksData.reduce((acc: any, click) => {
    //         const device = click.device_type || 'Unknown';
    //         acc[device] = (acc[device] || 0) + 1;
    //         return acc;
    //       }, {})
    //     ).map(([device, count]) => ({ device, count: count as number }));

    //     // Process country breakdown
    //     const countryBreakdown = Object.entries(
    //       clicksData.reduce((acc: any, click) => {
    //         const country = click.country || 'Unknown';
    //         acc[country] = (acc[country] || 0) + 1;
    //         return acc;
    //       }, {})
    //     )
    //       .map(([country, count]) => ({ country, count: count as number }))
    //       .sort((a, b) => b.count - a.count)
    //       .slice(0, 10);

    //     // Process top links
    //     const topLinks = Object.values(
    //       clicksData.reduce((acc: any, click) => {
    //         const link = click.smart_links;
    //         if (!acc[link.id]) {
    //           acc[link.id] = {
    //             id: link.id,
    //             title: link.title,
    //             short_url: link.short_url,
    //             original_url: link.original_url,
    //             clicks: link.clicks,
    //             platform: link.platform,
    //             avg_daily_clicks: Math.round(link.clicks / parseInt(dateRange))
    //           };
    //         }
    //         return acc;
    //       }, {})
    //     ).sort((a: any, b: any) => b.clicks - a.clicks);

    //     setData({
    //       totalClicks: clicksData.length,
    //       clicksToday,
    //       uniqueCountries,
    //       clicksByDay,
    //       deviceBreakdown,
    //       countryBreakdown,
    //       topLinks: topLinks as any
    //     });

    //   } catch (err) {
    //     console.error('Error loading analytics:', err);
    //     setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    //     toast({
    //       title: "Error",
    //       description: "Failed to load analytics data",
    //       variant: "destructive",
    //     });
    //   } finally {
    //     setIsLoading(false);
    //   }
  };

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Analytics</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Button
          onClick={() => loadAnalytics()}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data || data.totalClicks === 0) {
    return (
      <EmptyAnalyticsState
        title="No analytics data yet"
        description="Start sharing your smart links to see click data and insights."
        actionText="Create your first link"
        onAction={() => window.location.href = '/create-link'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 text-gray-700">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className='text-gray-700 bg-white'>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLink} onValueChange={setSelectedLink}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Select link" />
          </SelectTrigger>
          <SelectContent className='text-gray-700 bg-white'>
            <SelectItem value="all">All Links</SelectItem>
            {links.map(link => (
              <SelectItem key={link.id} value={link.id}>
                {link.title || link.short_url}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {data.deviceBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600">{item.device}</span>
                <span className="font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-4">
            {data.countryBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600">{item.country}</span>
                <span className="font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
