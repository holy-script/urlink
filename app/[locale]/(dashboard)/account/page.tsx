'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/lib/AuthContext';
import { AlertTriangle, Camera, Loader2, Trash } from 'lucide-react';
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
  name: string;
  email: string;
  language: string;
  notification_optin: boolean;
  avatar_url?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AccountPage() {
  const router = useRouter();
  // const { user } = useAuth();
  // Set mock user for demonstration purposes
  const user = {
    id: '12345',
    email: 'abc@example.com',
    name: 'John Doe',
  };
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    language: 'en',
    notification_optin: false
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    // Set initial profile state based on user data
    if (user) {
      setProfile({
        ...profile,
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, []);

  async function loadUserProfile() {
    if (!user) return;

    // try {
    //   const { data, error } = await supabase
    //     .from('users')
    //     .select('name, email, language, notification_optin, avatar_url')
    //     .eq('id', user.id)
    //     .maybeSingle();

    //   if (error) throw error;

    //   if (!data) {
    //     throw new Error('User profile not found');
    //   }

    //   setProfile({
    //     name: data.name || '',
    //     email: data.email || '',
    //     language: data.language || 'en',
    //     notification_optin: data.notification_optin || false,
    //     avatar_url: data.avatar_url
    //   });
    // } catch (error) {
    //   console.error('Error loading user profile:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to load user profile",
    //     variant: "destructive"
    //   });
    // }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // setLoading(true);
    // try {
    //   const { error } = await supabase
    //     .from('users')
    //     .update({
    //       name: profile.name,
    //       language: profile.language,
    //       notification_optin: profile.notification_optin
    //     })
    //     .eq('id', user.id);

    //   if (error) throw error;

    //   toast({
    //     title: "Success",
    //     description: "Profile updated successfully"
    //   });
    // } catch (error) {
    //   console.error('Error updating profile:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to update profile",
    //     variant: "destructive"
    //   });
    // } finally {
    //   setLoading(false);
    // }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      // toast({
      //   title: "Error",
      //   description: "File size must be less than 2MB",
      //   variant: "destructive"
      // });
      toast.error("File size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      // toast({
      //   title: "Error",
      //   description: "Only JPG, PNG, and WebP images are allowed",
      //   variant: "destructive"
      // });
      toast.error("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    // setUploadLoading(true);
    // try {
    //   // Upload to storage
    //   const fileExt = file.name.split('.').pop();
    //   const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    //   const { error: uploadError, data } = await supabase.storage
    //     .from('avatars')
    //     .upload(fileName, file);

    //   if (uploadError) throw uploadError;

    //   // Get public URL
    //   const { data: { publicUrl } } = supabase.storage
    //     .from('avatars')
    //     .getPublicUrl(fileName);

    //   // Update user profile
    //   const { error: updateError } = await supabase
    //     .from('users')
    //     .update({ avatar_url: publicUrl })
    //     .eq('id', user.id);

    //   if (updateError) throw updateError;

    //   setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    //   toast({
    //     title: "Success",
    //     description: "Profile picture updated successfully"
    //   });
    // } catch (error) {
    //   console.error('Error uploading avatar:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to upload profile picture",
    //     variant: "destructive"
    //   });
    // } finally {
    //   setUploadLoading(false);
    // }
  }

  async function handleRemoveAvatar() {
    if (!user || !profile.avatar_url) return;

    setUploadLoading(true);
    // try {
    //   // Extract filename from URL
    //   const fileName = profile.avatar_url.split('/').pop();
    //   if (fileName) {
    //     // Delete from storage
    //     const { error: deleteError } = await supabase.storage
    //       .from('avatars')
    //       .remove([fileName]);

    //     if (deleteError) throw deleteError;
    //   }

    //   // Update user profile
    //   const { error: updateError } = await supabase
    //     .from('users')
    //     .update({ avatar_url: null })
    //     .eq('id', user.id);

    //   if (updateError) throw updateError;

    //   setProfile(prev => ({ ...prev, avatar_url: undefined }));
    //   toast({
    //     title: "Success",
    //     description: "Profile picture removed successfully"
    //   });
    // } catch (error) {
    //   console.error('Error removing avatar:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to remove profile picture",
    //     variant: "destructive"
    //   });
    // } finally {
    //   setUploadLoading(false);
    // }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    // if (passwords.new !== passwords.confirm) {
    //   toast({
    //     title: "Error",
    //     description: "New passwords don't match",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    // setLoading(true);
    // try {
    //   const { error } = await supabase.auth.updateUser({
    //     password: passwords.new
    //   });

    //   if (error) throw error;

    //   setPasswords({ current: '', new: '', confirm: '' });
    //   toast({
    //     title: "Success",
    //     description: "Password updated successfully"
    //   });
    // } catch (error) {
    //   console.error('Error updating password:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to update password",
    //     variant: "destructive"
    //   });
    // } finally {
    //   setLoading(false);
    // }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmation !== 'DELETE') return;

    // setLoading(true);
    // try {
    //   // Record deletion reason
    //   const { error: deletionError } = await supabase
    //     .from('account_deletions')
    //     .insert({
    //       user_id: user.id,
    //       reason: 'User requested account deletion'
    //     });

    //   if (deletionError) throw deletionError;

    //   // Delete the user's auth account
    //   const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    //   if (authError) throw authError;

    //   // Sign out
    //   await supabase.auth.signOut();

    //   toast({
    //     title: "Account Deleted",
    //     description: "Your account has been permanently deleted"
    //   });

    //   router.push('/');
    // } catch (error) {
    //   console.error('Error deleting account:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete account. Please try again.",
    //     variant: "destructive"
    //   });
    // } finally {
    //   setLoading(false);
    //   setShowDeleteDialog(false);
    // }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 sm:mb-8">My Account</h1>

        {/* Personal Information */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl sm:mb-6">Personal Information</h2>

          {/* Profile Picture Section */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
              Profile Picture
            </label>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
              <div className="relative mx-auto sm:mx-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 sm:w-24 sm:h-24">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-xl font-semibold sm:text-2xl">
                      {profile.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label
                        className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors sm:w-8 sm:h-8"
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
                value={profile.name}
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Select
                value={profile.language}
                onValueChange={(value) => setProfile(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="w-full text-gray-900 bg-gray-50">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className='text-gray-900 bg-white'>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="notifications"
                checked={profile.notification_optin}
                onCheckedChange={(checked) =>
                  setProfile(prev => ({ ...prev, notification_optin: checked as boolean }))
                }
                className="mt-1 text-purple-600 focus:ring-purple-500 focus:ring-offset-purple-50 h-4 w-4 border-gray-300 rounded"
              />
              <label
                htmlFor="notifications"
                className="text-sm text-gray-700 leading-5"
              >
                Receive product updates and notifications
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:ml-auto sm:flex bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8">
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
                placeholder="Enter new password"
                className="w-full text-gray-900 bg-gray-50"
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
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="outline" disabled={loading} className="w-full sm:w-auto sm:ml-auto sm:flex bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Delete Account */}
        <Card className="p-4 border-red-200 sm:p-6 bg-red-50 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-red-600 mb-4 sm:text-xl sm:mb-6">Delete Your Account</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base sm:mb-6">
            This action is irreversible. All your links, data and settings will be permanently deleted.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full sm:w-auto sm:ml-auto sm:flex bg-red-600 hover:bg-red-700 text-white"
          >
            Delete My Account
          </Button>
        </Card>

        {/* Delete Account Modal */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="mx-4 max-w-md sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Delete Account Permanently
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-red-900 mb-1 text-sm sm:text-base">Warning: This cannot be undone</h4>
                  <ul className="text-xs text-red-700 space-y-1 sm:text-sm">
                    <li>• All your smart links will stop working</li>
                    <li>• Your analytics data will be deleted</li>
                    <li>• Your account settings will be lost</li>
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
                  className="font-mono"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full order-2 sm:order-1 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || loading}
                className="w-full order-1 sm:order-2 sm:w-auto"
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
