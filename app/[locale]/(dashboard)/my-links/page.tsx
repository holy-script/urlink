"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../lib/AuthContext';
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
  SlidersHorizontal,
  BarChart2,
  Filter,
  ArrowUpDown,
  Trash2,
  X,
  Check
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
import { useRouter } from '@/i18n/navigation';

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

interface ParsedUrl {
  domain: string;
  path: string;
  platform: string;
}

export default function MyLinks() {
  const router = useRouter();
  // const { user } = useAuth();
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platform, setPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteLink, setDeleteLink] = useState<SmartLink | null>(null);
  const [error, setError] = useState<string | null>('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    // mock data for demonstration purposes
    setLinks([
      {
        id: '1',
        title: 'My Instagram Profile',
        short_url: 'https://short.ly/insta-profile',
        original_url: 'https://www.instagram.com/myprofile',
        platform: 'instagram',
        clicks: 150,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'My YouTube Channel',
        short_url: 'https://short.ly/youtube-channel',
        original_url: 'https://www.youtube.com/channel/mychannel',
        platform: 'youtube',
        clicks: 300,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'My Amazon Wishlist',
        short_url: 'https://short.ly/amazon-wishlist',
        original_url: 'https://www.amazon.com/hz/wishlist/ls/mywishlist',
        platform: 'amazon',
        clicks: 75,
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'My TikTok Profile',
        short_url: 'https://short.ly/tiktok-profile',
        original_url: 'https://www.tiktok.com/@myprofile',
        platform: 'tiktok',
        clicks: 200,
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'My Spotify Playlist',
        short_url: 'https://short.ly/spotify-playlist',
        original_url: 'https://open.spotify.com/playlist/myplaylist',
        platform: 'spotify',
        clicks: 120,
        created_at: new Date().toISOString(),
      },
    ]);
    setIsLoading(false);
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     loadLinks();
  //   }
  // }, [user]);

  const loadLinks = async () => {
    // try {
    //   const { data, error } = await supabase
    //     .from('smart_links')
    //     .select('*')
    //     .eq('user_id', user?.id)
    //     .order('created_at', { ascending: false });

    //   if (error) throw error;
    //   setLinks(data || []);
    // } catch (err) {
    //   console.error('Error loading links:', err);
    //   setError(err instanceof Error ? err.message : 'Failed to load links');
    //   toast({
    //     title: "Error",
    //     description: "Failed to load your links",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const parseUrl = (url: string): ParsedUrl => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      let platform = 'other';

      if (domain.includes('instagram')) platform = 'instagram';
      else if (domain.includes('youtube')) platform = 'youtube';
      else if (domain.includes('amazon')) platform = 'amazon';
      else if (domain.includes('tiktok')) platform = 'tiktok';
      else if (domain.includes('spotify')) platform = 'spotify';

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000); // Reset after 2 seconds
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleDelete = async () => {
    if (!deleteLink) return;

    // try {
    //   const { error } = await supabase
    //     .from('smart_links')
    //     .delete()
    //     .eq('id', deleteLink.id);

    //   if (error) throw error;

    //   setLinks(links.filter(link => link.id !== deleteLink.id));
    //   toast({
    //     title: "Link deleted",
    //     description: "The link has been permanently deleted",
    //   });
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete link",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setDeleteLink(null);
    // }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Links</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Button
          onClick={() => loadLinks()}
          className="mt-4 text-red-600 hover:text-red-700"
          variant="outline"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  if (links.length === 0) {
    return (
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
            aria-label="Create first link"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create your first link
          </Button>
        </div>
      </Card>
    );
  }

  // Filter and sort links based on search term, platform, and sort order
  const filteredAndSortedLinks = links
    .filter(link => {
      const matchesSearch =
        link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.short_url.toLowerCase().includes(searchTerm.toLowerCase());

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
          return b.clicks - a.clicks;
        case 'least-clicks':
          return a.clicks - b.clicks;
        default:
          return 0;
      }
    });

  return (
    <>
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search links by title or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 text-gray-900 bg-transparent"
          />
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

        {/* Links Grid */}
        <div className="grid gap-4">
          {filteredAndSortedLinks.map((link) => {
            const { domain, path, platform } = parseUrl(link.original_url);
            const badgeColor = getPlatformBadgeColor(platform);
            const isCopied = copiedLinkId === link.id;

            return (
              <Card
                key={link.id}
                className="p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${badgeColor}`}>
                        {getPlatformIcon(platform)}
                        <span>{platform}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {link.title || 'Untitled Link'}
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#5e17eb]">
                          {new URL(link.short_url).hostname}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 px-2 transition-colors duration-200 ${isCopied
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-500 hover:text-[#5e17eb]'
                            }`}
                          onClick={() => copyToClipboard(link.short_url, link.id)}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">{domain}</span>
                        <span className="mx-1">/</span>
                        <span className="truncate max-w-md">{path}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="font-medium text-gray-900">
                          {link.clicks.toLocaleString()} clicks
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">
                          Created {format(new Date(link.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(link.short_url, '_blank')}
                            className="hover:bg-gray-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open link</TooltipContent>
                      </Tooltip>

                      {link.qr_png_url && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(link.qr_png_url, '_blank')}
                              className="hover:bg-gray-100"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download QR</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteLink(link)}
                            className="hover:bg-gray-100 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete link</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteLink(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
