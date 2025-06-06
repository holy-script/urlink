"use client";

import React, { useState, useEffect } from 'react';
import {
  Home,
  BarChart2,
  HelpCircle,
  Sparkles,
  Menu,
  X,
  CreditCard,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GlobalNav } from '@/components/GlobalNav';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../lib/AuthContext';
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
  // const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usage, setUsage] = useState<UserUsage | null>({
    click_usage: 0,
    click_limit: 500,
    payment_method_id: null
  });
  const [error, setError] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // useEffect(() => {
  //   if (user) {
  //     loadUserUsage();
  //   }
  // }, [user]);

  // const loadUserUsage = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('users')
  //       .select('click_usage, click_limit, payment_method_id')
  //       .eq('id', user?.id)
  //       .maybeSingle();

  //     if (error) throw error;

  //     // Set default values if data is not found
  //     setUsage({
  //       click_usage: data?.click_usage ?? 0,
  //       click_limit: data?.click_limit ?? 500,
  //       payment_method_id: data?.payment_method_id ?? null
  //     });
  //   } catch (error) {
  //     console.error('Error loading usage data:', error);
  //     setError(error instanceof Error ? error.message : 'Failed to load usage data');
  //     toast({
  //       title: "Error",
  //       description: "Failed to load usage data",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-100">
      <GlobalNav />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`
          fixed lg:fixed top-16 left-0 h-[calc(100vh-4rem)] w-[280px] lg:w-64 bg-[#EDE7F6] overflow-y-auto z-30
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <button
            className="lg:hidden absolute right-4 top-4 text-gray-600 hover:text-gray-900"
            onClick={closeSidebar}
          >
            <X className="h-6 w-6" />
          </button>

          {/* New Link Button - Hidden on mobile */}
          <div className="px-4 mt-6 mb-8 hidden lg:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-[#5e17eb] to-[#7b3aed] hover:from-[#4e13c4] hover:to-[#6429e3] text-white shadow-lg"
                    onClick={() => router.push('/create-link')}
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

          {/* Navigation */}
          <nav className="flex-1 px-4">
            <div className="space-y-1">
              {[
                { path: '/dashboard', icon: Home, label: 'Dashboard' },
                { path: '/my-links', icon: LinkIcon, label: 'My Links' },
                { path: '/analytics', icon: BarChart2, label: 'Analytics' },
                { path: '/faq', icon: HelpCircle, label: 'FAQ' },
                { path: '/support', icon: HelpCircle, label: 'Support' },
              ].map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
                      ? 'bg-[#5e17eb] text-white'
                      : 'text-gray-700 hover:bg-white/50'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Usage and Support Cards */}
          <div className="p-4 mt-auto">
            {/* Usage Card */}
            {usage && (
              <div className="mb-4">
                <FreeClicksCard
                  used={usage.click_usage}
                  total={usage.click_limit}
                  hasPaymentMethod={!!usage.payment_method_id}
                  onUpgradeClick={() => router.push('/billing')}
                />
              </div>
            )}

            {/* Support Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">Do you need help?</h3>
              <Button
                variant="outline"
                className="w-full mt-3 border-[#5e17eb] text-[#5e17eb] hover:bg-[#5e17eb] hover:text-white transition-colors"
                onClick={() => router.push('/support')}
              >
                Open a ticket
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Sticky New Link Button for Mobile */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 lg:hidden z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-gradient-to-r from-[#5e17eb] to-[#7b3aed] hover:from-[#4e13c4] hover:to-[#6429e3] text-white shadow-lg px-6 py-6 rounded-full"
                onClick={() => router.push('/create-link')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="text-base">Create new link</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start a new Smart Link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
