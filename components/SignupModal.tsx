"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '../lib/supabase';
// import { useLinkStore } from '../lib/store';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';

// interface SignupModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

const testimonials = [
  {
    quote: "URLINK helped us increase mobile app conversions by 3x.",
    author: "Sarah K.",
    role: "Marketing Director",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100"
  },
  {
    quote: "Super intuitive and powerful, I use it for every campaign now.",
    author: "Daniel M.",
    role: "Growth Strategist",
    image: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100"
  }
];

export function SignupModal() {
  // const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const pendingUrl = useLinkStore((state) => state.pendingUrl);
  const { toast } = useToast();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const isNameValid = name.length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const completedFields = [isNameValid, isEmailValid, isPasswordValid].filter(Boolean).length;
  const progress = 75 + (completedFields / 3) * 25;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignup = async () => {
    // try {
    //   const { data, error } = await supabase.auth.signInWithOAuth({
    //     provider: 'google',
    //     options: {
    //       redirectTo: `${window.location.origin}/dashboard`,
    //     },
    //   });

    //   if (error) throw error;
    // } catch (err: any) {
    //   setError('Unable to sign up with Google. Please try again.');
    //   toast({
    //     title: "Error",
    //     description: err.message,
    //     variant: "destructive",
    //   });
    // }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError('Please accept the Privacy Policy and Terms of Service to continue');
      return;
    }

    setLoading(true);

    // try {
    //   const { data: authData, error: authError } = await supabase.auth.signUp({
    //     email,
    //     password,
    //     options: {
    //       data: {
    //         full_name: name,
    //       },
    //     },
    //   });

    //   if (authError) {
    //     if (authError.message.includes('rate_limit')) {
    //       throw new Error('Please wait a moment before trying again');
    //     }
    //     throw authError;
    //   }

    //   if (authData.user) {
    //     await new Promise(resolve => setTimeout(resolve, 1000));

    //     const { error: profileError } = await supabase
    //       .from('users')
    //       .update({
    //         name,
    //         onboarding_completed: true
    //       })
    //       .eq('id', authData.user.id);

    //     if (profileError) {
    //       console.error('Error updating profile:', profileError);
    //     }

    //     toast({
    //       title: "Account created",
    //       description: "Welcome to URLINK!",
    //     });

    //     navigate('/dashboard');
    //   }
    // } catch (err: any) {
    //   setError(err.message);
    //   toast({
    //     title: "Error",
    //     description: err.message,
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };
  const t = useTranslations('LandingPage.hero');

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-8 bg-[#42c97a] hover:bg-[#42c97a] text-white text-xl flex items-center gap-2 rounded-lg group transition-all duration-500 ease-in-out overflow-hidden hover:pr-10 relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.5613 12.2442C18.9418 10.9684 18.0541 10.0807 16.7793 5.46223C16.7073 5.20234 16.4711 5.02234 16.201 5.02234C15.931 5.02234 15.6948 5.20235 15.6228 5.46223C14.348 10.0806 13.4604 10.9683 8.84077 12.2442C8.58088 12.3162 8.40088 12.5525 8.40088 12.8225C8.40088 13.0925 8.58089 13.3288 8.84077 13.4008C13.4603 14.6755 14.3468 15.5632 15.6228 20.1828C15.6948 20.4427 15.931 20.6227 16.201 20.6227C16.4711 20.6227 16.7073 20.4427 16.7793 20.1828C18.0552 15.5632 18.9417 14.6767 23.5613 13.4008C23.8212 13.3288 24.0012 13.0925 24.0012 12.8225C24.0012 12.5525 23.8212 12.3162 23.5613 12.2442Z" fill="white" />
              <path d="M2.65083 5.67827C5.46126 6.45457 5.95729 6.95074 6.73264 9.76008C6.80464 10.02 7.04203 10.2 7.31092 10.2C7.57982 10.2 7.81832 10.02 7.88921 9.76008C8.66438 6.95077 9.16055 6.45448 11.971 5.67827C12.2309 5.60626 12.4109 5.37 12.4109 5.09998C12.4109 4.82997 12.2309 4.5937 11.971 4.5217C9.16058 3.7454 8.66455 3.24923 7.88921 0.439892C7.81833 0.180001 7.58094 0 7.31092 0C7.0409 0 6.80464 0.180012 6.73264 0.439892C5.95634 3.25032 5.46017 3.74549 2.65083 4.5217C2.39094 4.5937 2.21094 4.82997 2.21094 5.09998C2.21094 5.37 2.39095 5.60626 2.65083 5.67827Z" fill="white" />
              <path d="M10.3599 18.0225C7.37516 17.1989 6.80143 16.6251 5.9777 13.6414C5.90569 13.3815 5.66943 13.2015 5.39941 13.2015C5.12939 13.2015 4.89313 13.3816 4.82113 13.6414C3.99756 16.625 3.42377 17.199 0.438915 18.0225C0.179024 18.0945 -0.000976562 18.3308 -0.000976562 18.6008C-0.000976562 18.8708 0.179035 19.1071 0.438915 19.1791C3.42366 20.0037 3.99739 20.5764 4.82113 23.5601C4.89313 23.82 5.12939 24 5.39941 24C5.66943 24 5.90569 23.82 5.9777 23.5601C6.80126 20.5754 7.37505 20.0025 10.3599 19.1791C10.6198 19.1071 10.7998 18.8708 10.7998 18.6008C10.7998 18.3308 10.6187 18.0945 10.3599 18.0225Z" fill="white" />
            </svg>
            <span className="flex items-center">
              {t('form.cta')}
              <span
                className="ml-2 overflow-hidden transition-opacity duration-500 ease-in-out delay-250 group-hover:opacity-100 opacity-0 absolute right-4"
              >
                <svg
                  width="19"
                  height="16"
                  viewBox="0 0 19 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7086 8.70711C19.0991 8.31658 19.0991 7.68342 18.7086 7.29289L12.3446 0.928932C11.9541 0.538408 11.3209 0.538408 10.9304 0.928932C10.5399 1.31946 10.5399 1.95262 10.9304 2.34315L16.5873 8L10.9304 13.6569C10.5399 14.0474 10.5399 14.6805 10.9304 15.0711C11.3209 15.4616 11.9541 15.4616 12.3446 15.0711L18.7086 8.70711ZM0.00146484 9H18.0015V7H0.00146484V9Z"
                    fill="white"
                  />
                </svg>
              </span>
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] p-0 bg-white">
          <DialogHeader>
            <DialogTitle className="sr-only">Complete Your Signup</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="absolute top-0 left-0 right-0">
              <div className="px-6 py-3 bg-[#5e17eb]/5 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#5e17eb]">
                    Step 2 of 2 — Complete your free signup to activate your smart link
                  </span>
                  <span className="text-sm font-medium text-[#5e17eb]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-1 bg-[#5e17eb]/20 [&>div]:bg-[#5e17eb]" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 pt-16">
              <div className="p-8">
                {/* {pendingUrl */}
                {true && (
                  <div className="mb-6 p-3 bg-purple-50 rounded-lg text-sm text-purple-700">
                    Your smart link is ready to be activated
                  </div>
                )}

                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  You're just one step away from generating your smart link, QR code and full analytics!
                </h2>

                <form onSubmit={handleEmailSignup} className="mt-8 space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5e17eb] focus:border-transparent focus:border-[#5e17eb] pr-10 placeholder:text-gray-400 text-black"
                    />
                    <AnimatePresence>
                      {isNameValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute right-3 top-3 -translate-y-1/2"
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5e17eb] focus:border-transparent focus:border-[#5e17eb] pr-10 placeholder:text-gray-400 text-black"
                    />
                    <AnimatePresence>
                      {isEmailValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute right-3 top-3 -translate-y-1/2"
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password (min. 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5e17eb] focus:border-transparent focus:border-[#5e17eb] placeholder:text-gray-400 text-black pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isPasswordValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute right-12 top-3 -translate-y-1/2"
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-1 border-2 border-[#5e17eb] data-[state=checked]:border-[#5e17eb] data-[state=checked]:text-white rounded-md data-[state=checked]:bg-[#5e17eb]"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-600 leading-tight mt-0.5"
                    >
                      I accept the{' '}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        className="text-[#5e17eb] hover:underline"
                      >
                        Privacy Policy
                      </a>
                      {' '}and{' '}
                      <a
                        href="/terms"
                        target="_blank"
                        className="text-[#5e17eb] hover:underline"
                      >
                        Terms of Service
                      </a>
                    </label>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#5e17eb] hover:bg-[#4e13c4] text-white py-3 rounded-lg font-medium transition-colors"
                    disabled={loading || !acceptedTerms}
                  >
                    {loading ? 'Creating Account...' : 'Unlock My Smart Link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-6 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 py-3 rounded-lg"
                  onClick={handleGoogleSignup}
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span className='text-[#5e17eb]'>Sign up with Google</span>
                </Button>

                <p className="text-sm text-center text-gray-600 mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#5e17eb] hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>

              <div className="hidden sm:block bg-gray-50 p-8 relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Everything you need to get started
                </h3>

                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Track your link with real-time analytics</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Create QR codes with live customization</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Automatically redirect users to the right app</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">No credit card required</span>
                  </li>
                </ul>

                <div className="mt-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTestimonial}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <p className="text-gray-700 italic mb-4">
                        "{testimonials[currentTestimonial].quote}"
                      </p>
                      <div className="flex items-center">
                        <img
                          src={testimonials[currentTestimonial].image}
                          alt={testimonials[currentTestimonial].author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {testimonials[currentTestimonial].author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {testimonials[currentTestimonial].role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}