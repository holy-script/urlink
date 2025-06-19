"use client";

import React, { useState, useEffect } from 'react';
import {
  Home,
  BarChart2,
  HelpCircle,
  Sparkles,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GlobalNav } from '@/components/GlobalNav';
import { FreeClicksCard } from '@/components/FreeClicksCard';
import { toast } from 'sonner';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserUsage {
  click_usage: number;
  click_limit: number;
  payment_method_id: string | null;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar state - only for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);

  const [usage, setUsage] = useState<UserUsage | null>({
    click_usage: 0,
    click_limit: 500,
    payment_method_id: null
  });

  // Mobile detection logic
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      // Auto-close sidebar when switching to desktop
      if (!event.matches) {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    setIsMobile(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isActive = (path: string) => pathname === path;

  const toggleSidebar = () => {
    // Only allow toggle on mobile
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const closeSidebar = () => {
    // Only close on mobile
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Helper function to conditionally close sidebar
  const handleNavigationClick = (callback?: () => void) => {
    if (callback) callback();
    if (isMobile) {
      closeSidebar();
    }
  };

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [pathname, isMobile]);

  // Close sidebar on escape key (mobile only)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile) {
        closeSidebar();
      }
    };

    if (isSidebarOpen && isMobile) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isSidebarOpen, isMobile]);

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/my-links', icon: LinkIcon, label: 'My Links' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/faq', icon: HelpCircle, label: 'FAQ' },
    { path: '/support', icon: HelpCircle, label: 'Support' },
  ];

  // Determine if sidebar should be visible
  const sidebarVisible = !isMobile || isSidebarOpen;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global Navigation - pass toggle function only for mobile */}
      <GlobalNav
        onToggleSidebar={isMobile ? toggleSidebar : undefined}
        isMobile={isMobile}
      />

      {/* Mobile Overlay - only show on mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-[280px] lg:w-64 bg-[#EDE7F6] 
          overflow-y-auto z-50 transition-transform duration-300 ease-in-out
          ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col">
          {/* Create New Link Button */}
          <div className="px-4 my-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-[#5e17eb] to-[#7b3aed] hover:from-[#4e13c4] hover:to-[#6429e3] text-white shadow-lg transition-all duration-200"
                    onClick={() => handleNavigationClick(() => router.push('/create-link'))}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create new link
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start a new Smart Link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4" aria-label="Dashboard navigation">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => handleNavigationClick()}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${active
                          ? 'bg-[#5e17eb] text-white shadow-md'
                          : 'text-gray-700 hover:bg-white/50 hover:shadow-sm'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 mt-auto space-y-4">
            {/* Usage Card */}
            {usage && (
              <FreeClicksCard
                used={usage.click_usage}
                total={usage.click_limit}
                hasPaymentMethod={!!usage.payment_method_id}
                onUpgradeClick={() => handleNavigationClick(() => router.push('/billing'))}
              />
            )}

            {/* Support Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Do you need help?
              </h3>
              <Button
                variant="outline"
                className="w-full border-[#5e17eb] text-[#5e17eb] hover:bg-[#5e17eb] hover:text-white transition-colors"
                onClick={() => handleNavigationClick(() => router.push('/support'))}
              >
                Open a ticket
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen transition-all duration-300 ease-in-out pt-16 lg:pl-64">
        <div className="w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      {!isSidebarOpen && isMobile && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-[#5e17eb] to-[#7b3aed] hover:from-[#4e13c4] hover:to-[#6429e3] text-white shadow-lg px-6 py-6 rounded-full transition-all duration-200 hover:scale-105"
                  onClick={() => router.push('/create-link')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span className="text-base font-medium">Create new link</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a new Smart Link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
