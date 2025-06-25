'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, Camera, Loader2, Trash, RefreshCw } from 'lucide-react';
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

interface UserProfile {
  name: string | null;
  email: string; // This comes from auth user
  notification_optin: boolean;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    notification_optin: false
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  async function loadUserProfile() {
    if (!user) {
      setError('Please log in to view your account');
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setError(null);

      console.log('📋 Loading user profile for:', user.id);

      // Load user profile from your users table (only fields that exist)
      const { data, error } = await supabase
        .from('users')
        .select(`
          name, 
          notification_optin, 
          avatar_url,
          created_at,
          updated_at
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error loading user profile:', error);
        throw error;
      }

      if (!data) {
        throw new Error('User profile not found');
      }

      console.log('✅ User profile loaded successfully');

      setProfile({
        name: data.name || '',
        email: user.email || '', // Get email from auth user object
        notification_optin: data.notification_optin || false,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at
      });

    } catch (err) {
      console.error('💥 Error loading user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(errorMessage);
      toast.error('Failed to load user profile', {
        description: errorMessage
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      console.log('📝 Updating user profile...');

      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          notification_optin: profile.notification_optin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully');

      toast.success('Profile updated successfully', {
        description: 'Your account information has been saved.'
      });

    } catch (err) {
      console.error('💥 Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error('Failed to update profile', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    setUploadLoading(true);
    try {
      console.log('📤 Uploading avatar...');

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('📷 Avatar uploaded, updating profile...');

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw updateError;
      }

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      console.log('✅ Avatar updated successfully');
      toast.success('Profile picture updated successfully');

    } catch (err) {
      console.error('💥 Error uploading avatar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture';
      toast.error('Failed to upload profile picture', {
        description: errorMessage
      });
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!user || !profile.avatar_url) return;

    setUploadLoading(true);
    try {
      console.log('🗑️ Removing avatar...');

      // Extract filename from URL
      const fileName = profile.avatar_url.split('/').pop();
      if (fileName) {
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) {
          console.warn('⚠️ Storage deletion warning:', deleteError);
          // Continue anyway, sometimes file might not exist
        }
      }

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw updateError;
      }

      setProfile(prev => ({ ...prev, avatar_url: null }));

      console.log('✅ Avatar removed successfully');
      toast.success('Profile picture removed successfully');

    } catch (err) {
      console.error('💥 Error removing avatar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove profile picture';
      toast.error('Failed to remove profile picture', {
        description: errorMessage
      });
    } finally {
      setUploadLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords don\'t match');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      console.log('🔒 Updating password...');

      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) {
        console.error('❌ Password update error:', error);
        throw error;
      }

      setPasswords({ current: '', new: '', confirm: '' });

      console.log('✅ Password updated successfully');
      toast.success('Password updated successfully', {
        description: 'Your password has been changed.'
      });

    } catch (err) {
      console.error('💥 Error updating password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      toast.error('Failed to update password', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmation !== 'DELETE') return;

    setLoading(true);
    try {
      console.log('🚨 Deleting account...');

      // Use your soft delete function from the database schema
      const { error: deletionError } = await supabase
        .rpc('soft_delete_user_and_links', { p_user_id: user.id });

      if (deletionError) {
        console.error('❌ Deletion error:', deletionError);
        throw deletionError;
      }

      console.log('✅ Account soft deleted successfully');

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('❌ Sign out error:', signOutError);
      }

      toast.success('Account deleted successfully', {
        description: 'Your account and all associated data have been deleted.'
      });

      // Redirect to home page
      router.push('/');

    } catch (err) {
      console.error('💥 Error deleting account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error('Failed to delete account', {
        description: `${errorMessage} Please try again.`
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  }

  // Get initials from name or email
  const getInitials = () => {
    if (profile.name && profile.name.trim()) {
      return profile.name.trim().charAt(0).toUpperCase();
    }
    if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-medium text-yellow-800">Authentication Required</h3>
                <p className="text-yellow-600">Please log in to view your account settings.</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/auth/login')}
              className="mt-4"
            >
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
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
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">Error Loading Account</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadUserProfile}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          {/* <Button
            onClick={loadUserProfile}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-[#5e17eb] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button> */}
        </div>

        {/* Personal Information */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8 bg-white shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl sm:mb-6">Personal Information</h2>

          {/* Profile Picture Section with Shadcn Avatar */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
              Profile Picture
            </label>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
              <div className="relative mx-auto sm:mx-0">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'Profile'} />
                  <AvatarFallback className="bg-[#5e17eb] text-white text-xl font-semibold sm:text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label
                        className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors sm:w-8 sm:h-8 shadow-sm"
                      >
                        {uploadLoading ? (
                          <Loader2 className="w-3 h-3 text-gray-500 animate-spin sm:w-4 sm:h-4" />
                        ) : (
                          <Camera className="w-3 h-3 text-gray-500 sm:w-4 sm:h-4" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarUpload}
                          disabled={uploadLoading}
                        />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload new photo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-sm text-gray-500">
                  Upload a new profile picture or remove the current one
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG or WebP. Max 2MB.
                </p>
                {profile.avatar_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadLoading}
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input
                value={profile.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="w-full text-gray-900 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                value={profile.email}
                disabled
                className="w-full text-gray-500 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="notifications"
                checked={profile.notification_optin}
                onCheckedChange={(checked) =>
                  setProfile(prev => ({ ...prev, notification_optin: checked as boolean }))
                }
                className="mt-1 text-[#5e17eb] focus:ring-[#5e17eb] focus:ring-offset-[#5e17eb]/50 h-4 w-4 border-gray-300 rounded"
              />
              <label
                htmlFor="notifications"
                className="text-sm text-gray-700 leading-5"
              >
                Receive product updates and notifications about your smart links
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8 bg-white shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl sm:mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Enter current password"
                className="w-full text-gray-900 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Enter new password (min 6 characters)"
                className="w-full text-gray-900 bg-gray-50"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full text-gray-900 bg-gray-50"
                minLength={6}
              />
            </div>

            <div className="pt-2 flex flex-col lg:flex-row justify-between items-center gap-2">
              <Button
                type="submit"
                variant="outline"
                disabled={loading || !passwords.new || !passwords.confirm}
                className="w-full sm:w-auto border-[#5e17eb] text-[#5e17eb] hover:bg-[#5e17eb] hover:text-white"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type='button'
                variant="link"
                onClick={() => {
                  toast.info('Reset Password link sent to your email', {
                    description: 'Please check your inbox.'
                  });
                }}
                className="w-full sm:w-auto text-[#5e17eb] hover:text-[#4e13c4] text-sm sm:text-base"
              >
                Forgot your password?
              </Button>
            </div>
          </form>
        </Card>

        {/* Delete Account */}
        <Card className="p-4 border-red-200 sm:p-6 bg-red-50 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-red-600 mb-4 sm:text-xl sm:mb-6">Delete Your Account</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base sm:mb-6">
            This action is irreversible. All your smart links, analytics data, and settings will be permanently deleted.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            Delete My Account
          </Button>
        </Card>

        {/* Delete Account Modal */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="mx-4 max-w-md sm:mx-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Delete Account Permanently
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-red-900 mb-1 text-sm sm:text-base">Warning: This cannot be undone</h4>
                  <ul className="text-xs text-red-700 space-y-1 sm:text-sm">
                    <li>• All your smart links will stop working immediately</li>
                    <li>• Your click analytics data will be deleted</li>
                    <li>• Your account settings will be lost</li>
                    <li>• Any remaining free clicks will be forfeited</li>
                    <li>• This action is permanent and immediate</li>
                  </ul>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  To confirm deletion, please type <span className="font-mono font-bold">DELETE</span> below:
                </p>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="font-mono bg-gray-50 text-gray-900 border-gray-300 focus:border-[#5e17eb] focus:ring-[#5e17eb] w-full"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                className="w-full order-2 sm:order-1 sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || loading}
                className="w-full order-1 sm:order-2 sm:w-auto bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Yes, delete my account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
