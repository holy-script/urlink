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
  Facebook
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

interface SmartLink {
  id: string;
  title: string | null;
  destination_url: string;
  short_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  click_count?: number;
}

interface ParsedUrl {
  domain: string;
  path: string;
  platform: string;
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
  const [error, setError] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // useEffect(() => {
  //   // Mock data for demonstration purposes
  //   setLinks([
  //     {
  //       id: '1',
  //       title: 'My First Link',
  //       destination_url: 'https://example.com',
  //       short_code: 'abc123',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 10
  //     },
  //     {
  //       id: '2',
  //       title: 'My Second Link',
  //       destination_url: 'https://example.com/second',
  //       short_code: 'def456',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 5
  //     },
  //     // Add from different platforms for testing
  //     {
  //       id: '3',
  //       title: 'Instagram Link',
  //       destination_url: 'https://instagram.com/myprofile',
  //       short_code: 'inst789',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 20
  //     },
  //     {
  //       id: '4',
  //       title: 'YouTube Video',
  //       destination_url: 'https://youtube.com/watch?v=xyz',
  //       short_code: 'yt123',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 15
  //     },
  //     {
  //       id: '5',
  //       title: 'Amazon Product',
  //       destination_url: 'https://amazon.com/product',
  //       short_code: 'amz456',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 8
  //     },
  //     {
  //       id: '6',
  //       title: 'TikTok Video',
  //       destination_url: 'https://tiktok.com/@myprofile',
  //       short_code: 'tiktok789',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 12
  //     },
  //     {
  //       id: '7',
  //       title: 'Spotify Playlist',
  //       destination_url: 'https://spotify.com/playlist/123',
  //       short_code: 'spotify123',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 18
  //     },
  //     {
  //       id: '8',
  //       title: 'Twitter Post',
  //       destination_url: 'https://twitter.com/myprofile/status/123456789',
  //       short_code: 'twitter123',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 25
  //     },
  //     {
  //       id: '9',
  //       title: 'LinkedIn Profile',
  //       destination_url: 'https://linkedin.com/in/myprofile',
  //       short_code: 'linkedin123',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 30
  //     },
  //     {
  //       id: '10',
  //       title: 'Facebook Page',
  //       destination_url: 'https://facebook.com/myprofile',
  //       short_code: 'facebook123',
  //       is_active: true,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       click_count: 22
  //     }
  //   ]);
  //   setIsLoading(false);
  //   setError(null);
  // }, []);

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

      // Fetch links with click counts
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select(`
          id,
          title,
          destination_url,
          short_code,
          is_active,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
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

  const parseUrl = (url: string): ParsedUrl => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      let platform = 'other';

      const hostname = domain.toLowerCase();
      if (hostname.includes('instagram')) platform = 'instagram';
      else if (hostname.includes('youtube')) platform = 'youtube';
      else if (hostname.includes('amazon')) platform = 'amazon';
      else if (hostname.includes('tiktok')) platform = 'tiktok';
      else if (hostname.includes('spotify')) platform = 'spotify';
      else if (hostname.includes('twitter') || hostname.includes('x.com')) platform = 'twitter';
      else if (hostname.includes('linkedin')) platform = 'linkedin';
      else if (hostname.includes('facebook')) platform = 'facebook';

      return { domain, path, platform };
    } catch (error) {
      return { domain: 'unknown', path: '', platform: 'other' };
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5" />;
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5" />;
      case 'amazon':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'spotify':
        return <Music2 className="w-3.5 h-3.5" />;
      case 'twitter':
        return <Twitter className="w-3.5 h-3.5" />;
      case 'linkedin':
        return <Linkedin className="w-3.5 h-3.5" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'youtube':
        return 'bg-red-100 text-red-800';
      case 'amazon':
        return 'bg-orange-100 text-orange-800';
      case 'spotify':
        return 'bg-green-100 text-green-800';
      case 'twitter':
        return 'bg-blue-100 text-blue-800';
      case 'linkedin':
        return 'bg-blue-100 text-blue-800';
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      const { error } = await supabase
        .from('links')
        .update({ is_active: false })
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

  const getShortUrl = (shortCode: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/${shortCode}`;
  };

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
              className="mt-4 text-red-600 hover:text-red-700"
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
          <Card className="p-12 text-center bg-gray-50 border-gray-200 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <LinkIcon className="w-12 h-12 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                You haven't created any links yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Start tracking clicks and engagement by creating your first smart link.
              </p>
              <Button
                onClick={() => router.push('/create-link')}
                className="mt-4 bg-[#5e17eb] text-white hover:bg-[#4e13c4] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create your first link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Filter and sort links
  const filteredAndSortedLinks = links
    .filter(link => {
      const { platform: linkPlatform } = parseUrl(link.destination_url);
      const matchesSearch =
        link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.destination_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform = platform === 'all' || linkPlatform === platform;

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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Links</h1>
          <Button
            onClick={() => router.push('/create-link')}
            className="bg-[#5e17eb] text-white hover:bg-[#4e13c4] w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create New Link
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search links by title or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 text-gray-900 bg-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="most-clicks">Most clicks</SelectItem>
                  <SelectItem value="least-clicks">Least clicks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Links Grid */}
        <div className="grid gap-4">
          {filteredAndSortedLinks.map((link) => {
            const { domain, path, platform: linkPlatform } = parseUrl(link.destination_url);
            const badgeColor = getPlatformBadgeColor(linkPlatform);
            const isCopied = copiedLinkId === link.id;
            const shortUrl = getShortUrl(link.short_code);

            return (
              <Card
                key={link.id}
                className="p-4 hover:shadow-md transition-shadow duration-200 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${badgeColor}`}>
                        {getPlatformIcon(linkPlatform)}
                        <span className="capitalize">{linkPlatform}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {link.title || 'Untitled Link'}
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
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-500 hover:text-[#5e17eb]'
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
                        <span className="font-medium">{domain}</span>
                        <span className="truncate max-w-md">{path}</span>
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
                            onClick={() => window.open(shortUrl, '_blank')}
                            className="hover:bg-gray-100 hover:text-blue-700 text-gray-500"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-blue-700 bg-white">
                          Open link
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteLink(link)}
                            className="hover:bg-gray-100 hover:text-red-500 text-gray-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-red-600 bg-white">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <DialogContent className="mx-4 max-w-md sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be undone and all analytics data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteLink(null)}
              className="w-full order-2 sm:order-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full order-1 sm:order-2 sm:w-auto"
            >
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
