import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, TrendingUp } from 'lucide-react';
import { LineChart } from './LineChart';
import { toast } from 'sonner';

interface TopLinkProps {
  link: {
    shortUrl: string;
    originalUrl: string;
    totalClicks: number;
    dailyAvg: number;
    platform: string;
  };
  chartData: Array<{ date: string; clicks: number; }>;
  onViewDetails: () => void;
}

export function TopLinkCard({ link, chartData, onViewDetails }: TopLinkProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy text: ", error);
      toast.error("Failed to copy link");
    }
  };

  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'youtube': return '▶️';
      case 'amazon': return '🛍️';
      default: return '🔗';
    }
  };

  return (
    <Card className="p-6 bg-white shadow-lg shadow-[#5e17eb]/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Top Performing Link This Week
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm text-gray-500">Smart Link</label>
            <div className="flex items-center mt-1">
              <span className="text-2xl mr-2">
                {getPlatformIcon(link.platform)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {link.shortUrl}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {link.originalUrl}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(link.shortUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Total Clicks</label>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {link.totalClicks.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Avg. Daily Clicks</label>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {link.dailyAvg.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <LineChart data={chartData} />
        </div>
      </div>
    </Card>
  );
}
