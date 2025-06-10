"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";

const troubleshootingTips = [
  {
    title: "Check your email",
    description: "The confirmation link may have expired. Request a new one.",
    icon: Mail,
  },
  {
    title: "Clear browser cache",
    description: "Sometimes cached data can interfere with authentication.",
    icon: RefreshCw,
  },
];

export default function AuthCodeErrorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % troubleshootingTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column - Error Message */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
        <div className="w-full max-w-[340px] sm:max-w-md md:max-w-lg">
          <Link href="/" className="flex items-center gap-2 md:gap-3 mb-6 md:mb-12">
            <div className="h-8 w-8 md:h-12 md:w-12 rounded-md bg-[#5e17eb] flex items-center justify-center p-1 md:p-2">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M9.26139 17.1175C11.3756 17.1206 12.8001 19.2408 12.0546 21.2264C11.616 22.3969 9.69693 23.8578 8.8077 24.8514C1.63493 32.868 9.69693 44.9708 19.7582 41.3156C22.6935 40.2495 23.6553 38.3213 25.833 36.5171C28.3101 34.4665 31.8353 36.9738 30.6209 39.9455C30.2428 40.8695 27.3589 43.6022 26.4742 44.3311C17.7892 51.4812 4.54003 47.705 0.916595 37.1236C-1.66488 29.5833 1.44892 22.7886 7.2198 17.9024C7.82774 17.3867 8.44324 17.116 9.25988 17.1175H9.26139Z" fill="white" />
                <path d="M30.8025 0.0302097C43.5496 -0.728958 52.0985 12.9708 45.8558 24.1466C44.7624 26.1035 42.5757 28.5686 40.8607 30.0249C37.7893 32.6336 34.1915 28.8347 36.2982 26.0657C37.6713 24.2601 39.5874 23.1319 40.7216 20.9754C45.3537 12.1708 35.8082 2.56631 26.9915 7.24381C24.7428 8.43701 23.7159 10.471 21.8694 11.7111C18.9507 13.6725 15.3469 10.0945 18.1296 6.91413C21.4989 3.06688 25.5503 0.343253 30.8025 0.0302097Z" fill="white" />
                <path d="M32.0016 12.9497C34.6224 12.9255 35.9911 16.0332 34.255 17.981C29.5956 22.6601 24.903 27.3043 20.2466 31.9863C18.7344 33.5062 17.3219 35.8154 14.813 34.8566C13.0164 34.1701 12.3797 31.9198 13.464 30.3394C19.0247 24.6139 24.6882 18.9444 30.4168 13.3882C30.8599 13.1221 31.4844 12.9557 32.0016 12.9512V12.9497Z" fill="white" />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold text-[#5e17eb]">URLINK</span>
          </Link>

          {/* Error Icon and Message */}
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-red-100 flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
            </motion.div>

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Authentication Error
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              We couldn't verify your email confirmation link. This might happen if the link has expired or is invalid.
            </p>
          </div>

          {/* Resend Email Form */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email to receive a new verification link
              </label>
              <Input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 focus:border-[#5e17eb] focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 placeholder:text-gray-400 text-black text-sm md:text-base"
              />
            </div>

            <Button
              onClick={handleResendEmail}
              disabled={loading || !email}
              className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </div>
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 md:space-y-4">
            <Button
              variant="outline"
              onClick={() => router.push("/signup")}
              className="w-full border border-gray-300 hover:bg-gray-50 py-2 md:py-3 rounded-lg text-sm md:text-base text-gray-900 hover:text-gray-700"
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Signing Up Again
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full border border-gray-300 hover:bg-gray-50 py-2 md:py-3 rounded-lg text-sm md:text-base text-gray-900 hover:text-gray-700"
            >
              <div className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Back to Homepage
              </div>
            </Button>
          </div>

          <div className="text-xs md:text-sm text-center text-gray-600 mt-6 md:mt-8">
            <span>Need help? </span>
            <Link href="mailto:support@urlink.io?subject=Support%20Request" className="text-[#5e17eb] hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Help Content */}
      <div className="hidden lg:block w-[600px] bg-[#5e17eb] p-8 text-white">
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-8">
              Troubleshooting Tips
            </h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center mr-3 mt-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Common Issues</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Email confirmation links expire after 24 hours for security reasons. If you clicked an old link, request a new verification email.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center mr-3 mt-1">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Check Your Email</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Sometimes verification emails end up in spam or promotions folders. Make sure to check all inbox sections.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center mr-3 mt-1">
                  <RefreshCw className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Try Again</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    If the issue persists, try clearing your browser cache or using a different browser.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rotating troubleshooting tips */}
          <div className="mt-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="flex items-center mb-3">
                  {React.createElement(troubleshootingTips[currentTip].icon, {
                    className: "w-5 h-5 text-white/90 mr-3"
                  })}
                  <h4 className="font-medium text-white">
                    {troubleshootingTips[currentTip].title}
                  </h4>
                </div>
                <p className="text-white/90 text-sm">
                  {troubleshootingTips[currentTip].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
