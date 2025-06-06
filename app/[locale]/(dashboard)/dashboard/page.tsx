"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertTriangle, Copy, Edit, Share2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartCard } from '@/components/analytics/ChartCard';
import { BarChart } from '@/components/analytics/BarChart';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartLink {
  id: string;
  title: string | null;
  short_url: string;
  original_url: string;
  platform: string;
  clicks: number;
  created_at: string;
  qr_color?: string;
  qr_png_url?: string;
}

interface AnalyticsData {
  source: string;
  percentage: number;
}

interface DeviceData {
  device: string;
  percentage: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>('');
  const [totalClicks, setTotalClicks] = useState(1368);
  const [clickPercentage, setClickPercentage] = useState(12);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([
    { source: 'Direct', percentage: 52 },
    { source: 'Social', percentage: 15 },
    { source: 'Email', percentage: 20 },
    { source: 'Paid', percentage: 13 },
  ]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([
    { device: 'Android Mobile', percentage: 40 },
    { device: 'Android Tablet', percentage: 10 },
    { device: 'iPhone', percentage: 25 },
    { device: 'iPad', percentage: 15 },
    { device: 'iPod', percentage: 5 },
    { device: 'Desktop', percentage: 5 },
  ]);

  useEffect(() => {
    // Mock data setup
    setLinks([
      {
        id: '1',
        title: 'Example Link',
        short_url: 'short.link/abc123',
        original_url: 'app.example.com/product1',
        platform: 'web',
        clicks: 123,
        created_at: '2023-08-15T12:00:00.000Z',
        qr_color: '#000000',
        qr_png_url: 'https://example.com/qr.png'
      },
      {
        id: '2',
        title: 'Another Link',
        short_url: 'short.link/def456',
        original_url: 'app.example.com/product2',
        platform: 'web',
        clicks: 456,
        created_at: '2023-08-14T14:30:00.000Z',
        qr_color: '#FF5733',
        qr_png_url: 'https://another.com/qr.png'
      },
      {
        id: '3',
        title: 'Third Link',
        short_url: 'short.link/ghi789',
        original_url: 'app.example.com/product3',
        platform: 'web',
        clicks: 789,
        created_at: '2023-08-13T09:45:00.000Z',
        qr_color: '#28A745',
        qr_png_url: 'https://third.com/qr.png'
      }
    ]);
    setIsLoading(false);
  }, []);

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
          {/* Links Table Card */}
          <Card className="bg-gray-100 shadow-lg shadow-[#5e17eb]/20 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Last Created</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <Table>
                  <TableCaption className="text-sm text-white p-4 bg-[#5e17eb]/70 mt-0 hover:bg-[#5e17eb]/80">Recently created links</TableCaption>
                  <TableHeader>
                    <TableRow className="bg-[#5e17eb]/70 hover:bg-[#5e17eb]/80 transition-colors">
                      <TableHead className="text-white font-medium">Link</TableHead>
                      <TableHead className="text-white font-medium">Destination</TableHead>
                      <TableHead className="text-white font-medium">Created</TableHead>
                      <TableHead className="text-white font-medium">Clicks</TableHead>
                      <TableHead className="text-white font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link: SmartLink) => (
                      <TableRow key={link.id} className="bg-gray-50 hover:bg-white transition-colors">
                        <TableCell className="text-gray-700 font-medium">{link.short_url}</TableCell>
                        <TableCell className="text-gray-700 max-w-xs truncate">{link.original_url}</TableCell>
                        <TableCell className="text-gray-700">{format(new Date(link.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-gray-700 font-semibold">{link.clicks}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                <p className="text-gray-700">Copy</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                <p className="text-gray-700">Edit</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className="text-gray-700 hover:bg-gray-200 hover:text-[#5e17eb] p-2 transition-colors">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className='bg-white text-gray-700 shadow-lg shadow-[#5e17eb]/20 rounded-lg p-2'>
                                <p className="text-gray-700">Share</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="bg-gray-100 shadow-lg shadow-[#5e17eb]/20 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Total Clicks Card */}
              <Card className="p-6 bg-gray-50 shadow-md shadow-[#5e17eb]/10 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Clicks</h3>
                </div>
                <div className="text-4xl font-bold text-gray-700">
                  {totalClicks.toLocaleString()}
                </div>
                <div className="text-sm text-green-500 mt-2 font-medium">
                  +{clickPercentage}%
                </div>
              </Card>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="w-full">
                  <Card className="bg-gray-50 shadow-md shadow-[#5e17eb]/10 rounded-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-700">Clicks by Source</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="w-full h-64 p-2">
                        <BarChart data={barChartData} color="#5e17eb" isHorizontal={true} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </TooltipProvider>
  );
}
