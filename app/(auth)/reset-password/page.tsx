"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Uncomment and modify when integrating with Supabase
    // try {
    //   const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    //     redirectTo: `${window.location.origin}/update-password`,
    //   });
    //   if (resetError) throw resetError;
    //   setSuccess(true);
    //   toast({ 
    //     title: "Reset link sent", 
    //     description: "Check your email for the password reset link" 
    //   });
    // } catch (err: any) {
    //   setError(err.message);
    //   toast({ title: "Error", description: err.message, variant: "destructive" });
    // } finally {
    //   setLoading(false);
    // }

    // For demo purposes
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
    setLoading(false);
    toast({
      title: "Reset link sent",
      description: "Check your email for the password reset link"
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form */}
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

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
            Reset your password
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {success ? (
            <div className="text-center p-4 md:p-6 bg-green-50 rounded-lg">
              <div className="mx-auto flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 mb-3 md:mb-4">
                <Check className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-green-900">Check your email</h3>
              <p className="mt-2 text-xs md:text-sm text-green-700">
                We've sent a password reset link to {email}
              </p>
              <Button
                className="mt-4 md:mt-6 w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                onClick={() => router.push("/login")}
              >
                Back to login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3 md:space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 focus:border-[#5e17eb] pr-10 placeholder:text-gray-400 text-black text-sm md:text-base"
                />
                <AnimatePresence>
                  {isEmailValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && <div className="text-red-500 text-xs md:text-sm text-center">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
                disabled={loading || !isEmailValid}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-xs md:text-sm text-center text-gray-600 mt-6 md:mt-8 flex flex-col md:flex-row md:justify-center gap-3 md:gap-4">
            <Link href='/login' className="text-[#5e17eb] hover:underline">
              ← Back to login
            </Link>
            <span className="hidden md:inline">
              Don't have an account?
            </span>
            <span className="md:hidden">
              No account?
            </span>
            <Link href="/signup" className="text-[#5e17eb] hover:underline">
              Sign Up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
