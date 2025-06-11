"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Copy,
  Download,
  Search,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Instagram,
  Youtube,
  ShoppingBag,
  Music2,
  Globe,
  BarChart2,
  Trash2,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  MapPin,
  QrCode,
  Smartphone,
  Monitor
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Platform type matching your database enum
type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'google-maps' | 'amazon';

// Updated interface to match new schema
interface SmartLink {
  id: string;
  title: string | null;
  original_url: string;        // Changed from destination_url
  android_deeplink: string;    // New field
  ios_deeplink: string;        // New field
  platform: Platform;         // New field (stored in DB)
  short_code: string;
  is_active: boolean;
  deleted_at: string | null;   // New field for soft delete
  created_at: string;
  updated_at: string;
  click_count?: number;
}

export default function MyLinks() {
  const router = useRouter();
  const { user } = useAuth();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platform, setPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteLink, setDeleteLink] = useState<SmartLink | null>(null);
  const [selectedLink, setSelectedLink] = useState<SmartLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLinks();
    }
  }, [user]);

  const loadLinks = async () => {
    if (!user) {
      setError('Please log in to view your links');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Updated query to match new schema
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
          deleted_at,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('deleted_at', null)  // Only get non-deleted links
        .order('created_at', { ascending: false });

      if (linksError) {
        throw linksError;
      }

      // Get click counts for each link
      const linksWithCounts = await Promise.all(
        (linksData || []).map(async (link) => {
          const { count, error: countError } = await supabase
            .from('link_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('link_id', link.id);

          if (countError) {
            console.warn('Error fetching click count for link:', link.id, countError);
          }

          return {
            ...link,
            click_count: count || 0
          };
        })
      );

      setLinks(linksWithCounts);
    } catch (err) {
      console.error('Error loading links:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load links';
      setError(errorMessage);
      toast.error('Failed to load your links', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified since platform is now stored in database
  const parseUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return {
        domain: urlObj.hostname,
        path: urlObj.pathname
      };
    } catch (error) {
      return {
        domain: 'unknown',
        path: ''
      };
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-red-600" />;
      case 'amazon':
        return <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />;
      case 'google-maps':
        return <MapPin className="w-3.5 h-3.5 text-blue-600" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'tiktok':
        return <Music2 className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  const getPlatformBadgeColor = (platform: Platform) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'youtube':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'amazon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'google-maps':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'facebook':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tiktok':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const handleDelete = async () => {
    if (!deleteLink) return;

    try {
      // Use soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('links')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', deleteLink.id);

      if (error) throw error;

      setLinks(links.filter(link => link.id !== deleteLink.id));
      toast.success("Link deleted successfully");
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error("Failed to delete link");
    } finally {
      setDeleteLink(null);
    }
  };

  // Updated to use new URL structure with platform
  const getShortUrl = (platform: Platform, shortCode: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smarturlink.com';
    return `${baseUrl}/${platform}/${shortCode}`;
  };

  // Generate QR code for the smart link
  const generateQRCode = (link: SmartLink) => {
    const shortUrl = getShortUrl(link.platform, link.short_code);
    return (
      <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-lg">
        <QRCodeCanvas
          value={shortUrl}
          size={200}
          level="H"
          includeMargin
          className="border border-gray-200 rounded-lg bg-white"
        />
        <p className="text-sm text-gray-600 text-center bg-gray-50 px-3 py-2 rounded-md">
          Scan to open: <span className="text-[#5e17eb] font-medium">{shortUrl}</span>
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5e17eb] bg-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
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
              className="mt-4 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border-red-200"
              variant="outline"
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-white border-gray-200 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <LinkIcon className="w-12 h-12 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                You haven't created any smart links yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Start creating platform-specific deep links with advanced analytics and click tracking.
              </p>
              <Button
                onClick={() => router.push('/create-link')}
                className="mt-4 bg-[#5e17eb] text-white hover:bg-[#4e13c4] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 mr-2 text-white" />
                Create your first smart link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Filter and sort links (now using stored platform field)
  const filteredAndSortedLinks = links
    .filter(link => {
      const matchesSearch =
        link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform = platform === 'all' || link.platform === platform;

      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most-clicks':
          return (b.click_count || 0) - (a.click_count || 0);
        case 'least-clicks':
          return (a.click_count || 0) - (b.click_count || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Smart Links</h1>
            <p className="text-gray-600 mt-1">Manage your platform-specific deep links</p>
          </div>
          <Button
            onClick={() => router.push('/create-link')}
            className="bg-[#5e17eb] text-white hover:bg-[#4e13c4] w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2 text-white" />
            Create New Link
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4 bg-white border-gray-200 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search links by title, URL, or short code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 text-gray-900 bg-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 text-gray-700">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="text-gray-700 hover:bg-gray-50">All platforms</SelectItem>
                  <SelectItem value="instagram" className="text-gray-700 hover:bg-gray-50">Instagram</SelectItem>
                  <SelectItem value="youtube" className="text-gray-700 hover:bg-gray-50">YouTube</SelectItem>
                  <SelectItem value="amazon" className="text-gray-700 hover:bg-gray-50">Amazon</SelectItem>
                  <SelectItem value="tiktok" className="text-gray-700 hover:bg-gray-50">TikTok</SelectItem>
                  <SelectItem value="facebook" className="text-gray-700 hover:bg-gray-50">Facebook</SelectItem>
                  <SelectItem value="google-maps" className="text-gray-700 hover:bg-gray-50">Google Maps</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 text-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="newest" className="text-gray-700 hover:bg-gray-50">Newest first</SelectItem>
                  <SelectItem value="oldest" className="text-gray-700 hover:bg-gray-50">Oldest first</SelectItem>
                  <SelectItem value="most-clicks" className="text-gray-700 hover:bg-gray-50">Most clicks</SelectItem>
                  <SelectItem value="least-clicks" className="text-gray-700 hover:bg-gray-50">Least clicks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Links Grid */}
        <div className="grid gap-4">
          {filteredAndSortedLinks.map((link) => {
            const { domain, path } = parseUrl(link.original_url);
            const badgeColor = getPlatformBadgeColor(link.platform);
            const isCopied = copiedLinkId === link.id;
            const shortUrl = getShortUrl(link.platform, link.short_code);

            return (
              <Card
                key={link.id}
                className="p-4 hover:shadow-md transition-shadow duration-200 sm:p-6 bg-white border-gray-200"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit border ${badgeColor}`}>
                        {getPlatformIcon(link.platform)}
                        <span className="capitalize">{link.platform.replace('-', ' ')}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {link.title || 'Untitled Smart Link'}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <p className="text-sm font-medium text-[#5e17eb] break-all sm:break-normal">
                          {shortUrl}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 px-2 transition-colors duration-200 w-fit ${isCopied
                            ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                            : 'text-gray-500 hover:text-[#5e17eb] bg-transparent hover:bg-gray-50'
                            }`}
                          onClick={() => copyToClipboard(shortUrl, link.id)}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-col text-sm text-gray-500 sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700">{domain}</span>
                        <span className="text-gray-500 truncate max-w-md">{path}</span>
                      </div>

                      {/* Deep Link Preview */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Smartphone className="w-3 h-3 mr-1 text-blue-600" />
                          Android Deep Link
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                          <Monitor className="w-3 h-3 mr-1 text-gray-600" />
                          iOS Deep Link
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2 mt-3 text-sm sm:flex-row sm:items-center sm:gap-4">
                        <span className="font-medium text-gray-900">
                          {(link.click_count || 0).toLocaleString()} clicks
                        </span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className="text-gray-500">
                          Created {format(new Date(link.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLink(link)}
                            className="hover:bg-blue-50 hover:text-blue-700 text-gray-500 bg-transparent"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white border-gray-700">
                          Generate QR Code
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(shortUrl, '_blank')}
                            className="hover:bg-blue-50 hover:text-blue-700 text-gray-500 bg-transparent"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white border-gray-700">
                          Open link
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteLink(link)}
                            className="hover:bg-red-50 hover:text-red-500 text-gray-500 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white border-gray-700">
                          Delete link
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedLink} onOpenChange={() => setSelectedLink(null)}>
        <DialogContent className="mx-4 max-w-md sm:mx-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">QR Code</DialogTitle>
            <DialogDescription className="text-gray-600">
              Scan this QR code to open your smart link
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4 bg-gray-50 rounded-lg">
            {selectedLink && generateQRCode(selectedLink)}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedLink(null)}
              className="w-full bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <DialogContent className="mx-4 max-w-md sm:mx-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Smart Link</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this smart link? This action cannot be undone and all analytics data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteLink(null)}
              className="w-full order-2 sm:order-1 sm:w-auto bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full order-1 sm:order-2 sm:w-auto bg-red-600 text-white hover:bg-red-700 border-red-600"
            >
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
