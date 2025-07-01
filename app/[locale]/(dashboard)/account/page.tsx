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
import { AlertTriangle, Camera, Loader2, Trash, RefreshCw, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  is_email_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('Account');

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    notification_optin: false,
    is_email_verified: false
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
      setError(t('errors.loginRequired'));
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setError(null);

      console.log(t('console.loadingProfile'), user.id);

      // Load user profile from your users table including is_email_verified
      const { data, error } = await supabase
        .from('users')
        .select(`
          name, 
          notification_optin, 
          avatar_url,
          is_email_verified,
          created_at,
          updated_at
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(t('console.profileLoadError'), error);
        throw error;
      }

      if (!data) {
        throw new Error(t('errors.profileNotFound'));
      }

      console.log(t('console.profileLoaded'));

      setProfile({
        name: data.name || '',
        email: user.email || '', // Get email from auth user object
        notification_optin: data.notification_optin || false,
        avatar_url: data.avatar_url,
        is_email_verified: data.is_email_verified || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      });

    } catch (err) {
      console.error(t('console.profileLoadFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('messages.loadProfileError');
      setError(errorMessage);
      toast.error(t('messages.loadProfileError'), {
        description: t('messages.loadProfileErrorDesc', { error: errorMessage })
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
      console.log(t('console.updatingProfile'));

      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          notification_optin: profile.notification_optin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error(t('console.profileUpdateError'), error);
        throw error;
      }

      console.log(t('console.profileUpdated'));

      toast.success(t('messages.profileUpdateSuccess'), {
        description: t('messages.profileUpdateSuccessDesc')
      });

    } catch (err) {
      console.error(t('console.profileUpdateFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('messages.profileUpdateError');
      toast.error(t('messages.profileUpdateError'), {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendVerification() {
    if (!user?.email) return;

    setSendingVerification(true);
    try {
      console.log('Sending verification email to:', user.email);

      // Call your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { email: user.email }
      });

      if (error) {
        console.error('Verification email error:', error);
        throw error;
      }

      console.log('Verification email sent successfully');
      toast.success(t('messages.verificationEmailSent'), {
        description: t('messages.verificationEmailSentDesc')
      });

    } catch (err) {
      console.error('Failed to send verification email:', err);
      const errorMessage = err instanceof Error ? err.message : t('messages.verificationEmailError');
      toast.error(t('messages.verificationEmailError'), {
        description: errorMessage
      });
    } finally {
      setSendingVerification(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('messages.fileSizeError'));
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(t('messages.fileTypeError'));
      return;
    }

    setUploadLoading(true);
    try {
      console.log(t('console.uploadingAvatar'));

      // Create user-specific folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Delete existing avatar if it exists
      if (profile.avatar_url) {
        const oldFileName = profile.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldFileName}`]);
        }
      }

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(t('console.avatarUploadError'), uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log(t('console.avatarUploaded'));

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error(t('console.profileUpdateError'), updateError);
        throw updateError;
      }

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success(t('messages.avatarUploadSuccess'));

    } catch (err) {
      console.error(t('console.avatarUploadFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('messages.avatarUploadError');
      toast.error(t('messages.avatarUploadError'), {
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
      console.log(t('console.removingAvatar'));

      // Extract filename from URL and remove from storage
      const fileName = profile.avatar_url.split('/').slice(-2).join('/'); // Gets "userId/filename"

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (deleteError) {
        console.warn(t('console.avatarDeleteWarning'), deleteError);
        // Continue anyway, sometimes file might not exist
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
        console.error(t('console.avatarRemoveError'), updateError);
        throw updateError;
      }

      setProfile(prev => ({ ...prev, avatar_url: null }));
      toast.success(t('messages.avatarRemoveSuccess'));

    } catch (err) {
      console.error(t('console.avatarRemoveFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('messages.avatarRemoveError');
      toast.error(t('messages.avatarRemoveError'), {
        description: errorMessage
      });
    } finally {
      setUploadLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error(t('messages.passwordMismatch'));
      return;
    }

    if (passwords.new.length < 6) {
      toast.error(t('messages.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      console.log(t('console.updatingPassword'));

      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) {
        console.error(t('console.passwordUpdateError'), error);
        throw error;
      }

      setPasswords({ current: '', new: '', confirm: '' });

      console.log(t('console.passwordUpdated'));
      toast.success(t('messages.passwordUpdateSuccess'), {
        description: t('messages.passwordUpdateSuccessDesc')
      });

    } catch (err) {
      console.error(t('console.passwordUpdateFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('messages.passwordUpdateError');
      toast.error(t('messages.passwordUpdateError'), {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmation !== t('dialogs.deleteAccount.confirmation.deleteText')) return;

    setLoading(true);
    try {
      console.log(t('console.deletingAccount'));

      // Use your soft delete function from the database schema
      const { error: deletionError } = await supabase
        .rpc('soft_delete_user_and_links', { p_user_id: user.id });

      if (deletionError) {
        console.error(t('console.accountDeleteError'), deletionError);
        throw deletionError;
      }

      console.log(t('console.accountDeleted'));

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error(t('console.signOutError'), signOutError);
      }

      toast.success(t('messages.accountDeleteSuccess'), {
        description: t('messages.accountDeleteSuccessDesc')
      });

      // Redirect to home page
      router.push('/');

    } catch (err) {
      console.error(t('console.accountDeleteFailed'), err);
      const errorMessage = err instanceof Error ? err.message : t('messages.accountDeleteError');
      toast.error(t('messages.accountDeleteError'), {
        description: t('messages.accountDeleteErrorDesc', { error: errorMessage })
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
                <h3 className="font-medium text-yellow-800">{t('errors.authRequired.title')}</h3>
                <p className="text-yellow-600">{t('errors.authRequired.description')}</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/auth/login')}
              className="mt-4"
            >
              {t('errors.authRequired.button')}
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
                <h3 className="font-medium text-red-800">{t('errors.loadingAccount.title')}</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <Button
              onClick={loadUserProfile}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('errors.loadingAccount.button')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Define keys for delete warning items
  const warningItemKeys = ['0', '1', '2', '3', '4'] as const;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
        </div>

        {/* Personal Information */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8 bg-white shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl sm:mb-6">{t('sections.personalInfo.title')}</h2>

          {/* Profile Picture Section with Shadcn Avatar */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
              {t('sections.personalInfo.profilePicture.label')}
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
                      <p>{t('sections.personalInfo.profilePicture.uploadTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-sm text-gray-500">
                  {t('sections.personalInfo.profilePicture.description')}
                </p>
                <p className="text-xs text-gray-400">
                  {t('sections.personalInfo.profilePicture.sizeLimit')}
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
                    {t('sections.personalInfo.profilePicture.removeButton')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('sections.personalInfo.fullName.label')}</label>
              <Input
                value={profile.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('sections.personalInfo.fullName.placeholder')}
                className="w-full text-gray-900 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('sections.personalInfo.email.label')}</label>
              <Input
                value={profile.email}
                disabled
                className="w-full text-gray-500 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                {t('sections.personalInfo.email.disclaimer')}
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
                {t('sections.personalInfo.notifications.label')}
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
              >
                {loading ? t('sections.personalInfo.saving') : t('sections.personalInfo.saveButton')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Email Verification Status */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8 bg-white shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl sm:mb-6">
            {t('sections.emailVerification.title')}
          </h2>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {profile.is_email_verified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {profile.is_email_verified
                      ? t('sections.emailVerification.verified.title')
                      : t('sections.emailVerification.unverified.title')
                    }
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.is_email_verified
                      ? t('sections.emailVerification.verified.description')
                      : t('sections.emailVerification.unverified.description')
                    }
                  </p>
                  {profile.is_email_verified && profile.updated_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t('sections.emailVerification.verified.verifiedAt')} {' '}
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {!profile.is_email_verified && (
                  <Button
                    onClick={handleSendVerification}
                    disabled={sendingVerification}
                    className="bg-[#5e17eb] hover:bg-[#4e13c4] text-white"
                    size="sm"
                  >
                    {sendingVerification ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('sections.emailVerification.sending')}
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        {t('sections.emailVerification.resendButton')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-4 mb-6 sm:p-6 sm:mb-8 bg-white shadow-lg shadow-[#5e17eb]/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:text-xl sm:mb-6">{t('sections.changePassword.title')}</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('sections.changePassword.currentPassword.label')}</label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                placeholder={t('sections.changePassword.currentPassword.placeholder')}
                className="w-full text-gray-900 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('sections.changePassword.newPassword.label')}</label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                placeholder={t('sections.changePassword.newPassword.placeholder')}
                className="w-full text-gray-900 bg-gray-50"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('sections.changePassword.confirmPassword.label')}</label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder={t('sections.changePassword.confirmPassword.placeholder')}
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
                {loading ? t('sections.changePassword.updating') : t('sections.changePassword.updateButton')}
              </Button>
              <Button
                type='button'
                variant="link"
                onClick={() => {
                  toast.info(t('messages.passwordResetSent'), {
                    description: t('messages.passwordResetSentDesc')
                  });
                }}
                className="w-full sm:w-auto text-[#5e17eb] hover:text-[#4e13c4] text-sm sm:text-base"
              >
                {t('sections.changePassword.forgotPassword')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Delete Account */}
        <Card className="p-4 border-red-200 sm:p-6 bg-red-50 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-red-600 mb-4 sm:text-xl sm:mb-6">{t('sections.deleteAccount.title')}</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base sm:mb-6">
            {t('sections.deleteAccount.description')}
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            {t('sections.deleteAccount.deleteButton')}
          </Button>
        </Card>

        {/* Delete Account Modal */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="mx-4 max-w-md sm:mx-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 text-lg">
                <AlertTriangle className="h-5 w-5" />
                {t('dialogs.deleteAccount.title')}
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-red-900 mb-1 text-sm sm:text-base">{t('dialogs.deleteAccount.warning.title')}</h4>
                  <ul className="text-xs text-red-700 space-y-1 sm:text-sm">
                    {warningItemKeys.map((key) => (
                      <li key={key}>• {t(`dialogs.deleteAccount.warning.items.${key}`)}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {t('dialogs.deleteAccount.confirmation.instruction', {
                    deleteText: t('dialogs.deleteAccount.confirmation.deleteText')
                  })}
                </p>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t('dialogs.deleteAccount.confirmation.placeholder')}
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
                {t('dialogs.deleteAccount.buttons.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== t('dialogs.deleteAccount.confirmation.deleteText') || loading}
                className="w-full order-1 sm:order-2 sm:w-auto bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('dialogs.deleteAccount.buttons.deleting') : t('dialogs.deleteAccount.buttons.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
