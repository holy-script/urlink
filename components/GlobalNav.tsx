'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { supabase } from '@/utils/supabase/client';

interface GlobalNavProps {
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

interface UserData {
  clicks: number;
  limit: number;
}

interface UserProfile {
  name: string | null;
  avatar_url: string | null;
}

export function GlobalNav({ onToggleSidebar, isMobile = false }: GlobalNavProps) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();
  const t = useTranslations('DashboardLayout.globalNav');

  // State management
  const [usageData, setUsageData] = useState<UserData>({ clicks: 0, limit: 500 });
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: null, avatar_url: null });
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user && !loading) {
      loadUserData();
    }
  }, [user, loading]);

  const loadUserData = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      setDataError('User not authenticated');
      return;
    }

    setDataLoading(true);
    setDataError(null);

    try {
      console.log('Loading user profile data for:', user.id);

      // Fetch user profile from users table (following account page pattern)
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile load error:', profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error('Profile not found');
      }

      console.log('Profile loaded successfully');

      // Set the profile data
      setUserProfile({
        name: profileData.name,
        avatar_url: profileData.avatar_url
      });

      // Set usage data (you can implement actual usage fetching here)
      setUsageData({
        clicks: 0, // Replace with actual click usage if you have it
        limit: 500
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      const errorMessage = error instanceof Error ? error.message : t('messages.loadUserDataFailed');
      setDataError(errorMessage);

      // Set fallback data
      setUserProfile({
        name: null,
        avatar_url: null
      });
      setUsageData({ clicks: 0, limit: 500 });

      toast.error(t('messages.loadUserDataFailed'), {
        description: t('messages.usingCachedData'),
        action: {
          label: t('messages.retryAction'),
          onClick: () => loadUserData(),
        },
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut();
      toast.success(t('messages.logoutSuccess'));
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('messages.logoutFailed'), {
        description: t('messages.logoutRetry'),
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  // Computed values
  const isOverLimit = usageData.clicks >= 500;
  const displayName = userProfile.name || user?.email?.split('@')[0] || t('userMenu.fallbackName');

  // Get initials from name or email (following account page pattern)
  const getInitials = () => {
    if (userProfile.name && userProfile.name.trim()) {
      return userProfile.name.trim().charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const menuItems = [
    { icon: t('userMenu.items.myAccount.icon'), label: t('userMenu.items.myAccount.label'), href: "/account" },
    { icon: t('userMenu.items.billing.icon'), label: t('userMenu.items.billing.label'), href: "/billing" },
    { icon: t('userMenu.items.support.icon'), label: t('userMenu.items.support.label'), href: "/support" },
    { icon: t('userMenu.items.logout.icon'), label: t('userMenu.items.logout.label'), onClick: handleLogout, danger: true },
  ];

  // Loading state
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <nav className="h-full">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-full w-full flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center gap-3">
                {/* Only show menu button on mobile */}
                {isMobile && onToggleSidebar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-gray-100"
                    disabled={true}
                  >
                    <Menu className="h-5 w-5 text-gray-400" />
                  </Button>
                )}

                <Link href="/dashboard" className="flex items-center">
                  <Image
                    src="/urlinklogo-purple.svg"
                    alt="URLINK"
                    width={200}
                    height={50}
                    className="h-16 w-auto"
                    priority
                  />
                </Link>
              </div>

              {/* Loading spinner */}
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5e17eb]"></div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  // Error state
  if (error) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-red-200 z-50">
        <nav className="h-full">
          <div className="h-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-full w-full flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center gap-3">
                {/* Only show menu button on mobile */}
                {isMobile && onToggleSidebar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-gray-100"
                    disabled={true}
                  >
                    <Menu className="h-5 w-5 text-gray-400" />
                  </Button>
                )}

                <Link href="/dashboard" className="flex items-center">
                  <Image
                    src="/urlinklogo-purple.svg"
                    alt="URLINK"
                    width={200}
                    height={50}
                    className="h-16 w-auto"
                    priority
                  />
                </Link>
              </div>

              {/* Error state */}
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm hidden sm:inline">{t('loading.authError')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  // Main render
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <nav className="h-full">
        <div className="h-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-full w-full flex items-center justify-between">

            {/* Left side - Hamburger Menu and Logo */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Button - Only show on mobile when onToggleSidebar is provided */}
              {isMobile && onToggleSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSidebar}
                  className="p-2 hover:bg-gray-100 transition-colors duration-200"
                  aria-label={t('accessibility.toggleSidebar')}
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </Button>
              )}

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/urlinklogo-purple.svg"
                  alt="URLINK"
                  width={200}
                  height={50}
                  className="h-16 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Right side - Usage Badge and User Menu */}
            <div className="flex items-center gap-4">
              {/* Usage Badge */}
              {dataLoading ? (
                <div className="hidden md:flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#5e17eb]"></div>
                </div>
              ) : dataError ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUserData}
                  className="hidden md:flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">{t('messages.retryAction')}</span>
                </Button>
              ) : (
                <Badge
                  variant="secondary"
                  className={`
                    hidden md:inline-flex items-center px-3 py-1 transition-colors
                    ${isOverLimit
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }
                  `}
                >
                  {isOverLimit ? t('badges.payPerClick') : t('badges.freeTier')}
                </Badge>
              )}

              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2 hover:bg-gray-100 transition-colors"
                    disabled={logoutLoading}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userProfile.avatar_url || undefined}
                        alt={displayName || t('accessibility.userAvatar')}
                      />
                      <AvatarFallback className='bg-purple-100 text-purple-600'>
                        {dataLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#5e17eb]"></div>
                        ) : (
                          getInitials()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex items-center">
                      {dataLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#5e17eb]"></div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                            {displayName}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
                        </>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white rounded-lg shadow-lg py-1"
                >
                  {/* User Info Header */}
                  <DropdownMenuLabel className="px-4 py-2">
                    <div className="flex flex-col space-y-1">
                      {dataLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#5e17eb]"></div>
                          <span className="text-sm text-gray-500">{t('userMenu.loadingData')}</span>
                        </div>
                      ) : dataError ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">{t('userMenu.errorLoadingData')}</span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  {/* Data Error Retry Option */}
                  {dataError && (
                    <>
                      <DropdownMenuItem
                        onClick={loadUserData}
                        className="text-sm cursor-pointer flex items-center p-0"
                      >
                        <div className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md flex items-center gap-2 w-full h-full px-3 py-2">
                          <RefreshCw className="h-4 w-4" />
                          <span className='truncate'>{t('userMenu.retryLoadingData')}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200" />
                    </>
                  )}

                  {/* Menu Items */}
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <DropdownMenuItem
                        onClick={item.onClick || (() => router.push(item.href!))}
                        className="text-sm cursor-pointer flex items-center p-0"
                        disabled={item.onClick === handleLogout && logoutLoading}
                      >
                        <div className={`
                          ${item.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700 hover:text-gray-900'}
                          hover:bg-gray-100 rounded-md flex items-center gap-2 w-full h-full px-3 py-2 transition-colors
                          ${item.onClick === handleLogout && logoutLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                          {item.onClick === handleLogout && logoutLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                          ) : (
                            <span className="mr-2">{item.icon}</span>
                          )}
                          <span className='truncate'>
                            {item.onClick === handleLogout && logoutLoading ? t('userMenu.loggingOut') : item.label}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      {index < menuItems.length - 1 && (
                        <DropdownMenuSeparator className="bg-gray-200" />
                      )}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
