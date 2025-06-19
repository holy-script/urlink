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

interface GlobalNavProps {
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

interface UserData {
  clicks: number;
  limit: number;
}

export function GlobalNav({ onToggleSidebar, isMobile = false }: GlobalNavProps) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();

  // State management
  const [usageData, setUsageData] = useState<UserData>({ clicks: 0, limit: 500 });
  const [fullName, setFullName] = useState('');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = {
        name: user.user_metadata?.name || '',
        click_usage: user.user_metadata?.click_usage || 0,
        click_limit: user.user_metadata?.click_limit || 500
      };

      // Handle no data case
      if (!userData) {
        setUsageData({ clicks: 0, limit: 500 });
        setFullName(user.email?.split('@')[0] || '');
        toast.warning('User data not found, using defaults');
        return;
      }

      // Set the data
      setUsageData({
        clicks: userData.click_usage || 0,
        limit: userData.click_limit || 500
      });
      setFullName(userData.name || user.email?.split('@')[0] || '');

    } catch (error) {
      console.error('Error loading user data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
      setDataError(errorMessage);

      // Set fallback data
      setUsageData({ clicks: 0, limit: 500 });
      setFullName(user.email?.split('@')[0] || '');

      toast.error('Failed to load user data', {
        description: 'Using cached data. Click to retry.',
        action: {
          label: 'Retry',
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
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out', {
        description: 'Please try again',
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  // Computed values
  const isOverLimit = usageData.clicks >= 500;

  const menuItems = [
    { icon: "👤", label: "My Account", href: "/account" },
    { icon: "💳", label: "Billing & Usage", href: "/billing" },
    { icon: "🛠️", label: "Support", href: "/support" },
    { icon: "🔓", label: "Log out", onClick: handleLogout, danger: true },
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
                <span className="text-sm hidden sm:inline">Authentication error</span>
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
                  aria-label="Toggle sidebar"
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
                  <span className="text-xs">Retry</span>
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
                  {isOverLimit ? 'Pay-per-click' : 'Free Tier'}
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
                        src={user?.user_metadata?.avatar_url}
                        alt={fullName || 'User avatar'}
                      />
                      <AvatarFallback className='bg-purple-100 text-purple-600'>
                        {dataLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#5e17eb]"></div>
                        ) : (
                          fullName ? fullName.charAt(0).toUpperCase() : 'U'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex items-center">
                      {dataLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#5e17eb]"></div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                            {fullName || 'User'}
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
                          <span className="text-sm text-gray-500">Loading...</span>
                        </div>
                      ) : dataError ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">Error loading data</span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{fullName || 'User'}</p>
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
                          <span className='truncate'>Retry loading data</span>
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
                            {item.onClick === handleLogout && logoutLoading ? 'Logging out...' : item.label}
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
