"use client"

import { useState, useEffect } from "react"
import { Upload, Eye, EyeOff, Loader2 } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  getCurrentSessionUser,
  changePassword,
  editUserData,
  getUserAvatar,
  setUserAvatar,
  deleteAccount,
  type UserData,
} from "@/lib/profile/profile"

function AlertDialogPasswordChange({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: (currentPassword: string, newPassword: string) => Promise<void> }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    setIsConfirming(true)
    setError(null)
    try {
      await onConfirm(currentPassword, newPassword)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Change Password</AlertDialogTitle>
          <AlertDialogDescription>
            Enter your current password and choose a new password to update your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await getCurrentSessionUser()
        const userData: UserData = {
          firstname: user.firstname,
          middlename: user.middlename,
          lastname: user.lastname,
          studentId: user.studentId,
          degreeProgram: user.degreeProgram,
          yearLevel: user.yearLevel,
          section: user.section,
          name: `${user.firstname} ${user.middlename} ${user.lastname}`.trim()
        }
        setUserData(userData)

        const avatar = await getUserAvatar()
        setAvatarUrl(avatar)
      } catch (error) {
        console.error("Error fetching user data or avatar:", error)
        toast({
          title: "Error",
          description: "Failed to fetch user data or avatar.",
          variant: "destructive",
        })
      }
    }
    fetchUserData()
  }, [toast])

  const handleEditUserData = async () => {
    if (!userData) return

    setIsUpdatingProfile(true)
    try {
      const updatedData = {
        ...userData,
        name: `${userData.firstname || ''} ${userData.middlename || ''} ${userData.lastname || ''}`.trim()
      }
      await editUserData(updatedData)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const newAvatarUrl = await setUserAvatar(file)
      setAvatarUrl(newAvatarUrl)
      toast({
        title: "Success",
        description: "Avatar updated successfully.",
      })
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleChangePassword = () => {
    setIsPasswordChangeModalOpen(true)
  }

  const handleConfirmPasswordChange = async (currentPassword: string, newPassword: string) => {
    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast({
        title: "Success",
        description: "Password changed successfully.",
      })
      setIsPasswordChangeModalOpen(false)
    } catch (error) {
      console.error("Error changing password:", error)
      throw error
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (password: string) => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount(password);
      toast({
        title: "Success",
        description: "Your account has been deleted.",
      });
      // Redirect to home page or login page after successful deletion
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof Error) {
        if (error.message.includes("session has expired")) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log out and log in again before trying to delete your account.",
            variant: "destructive",
          });
        } else if (error.message.includes("don't have the necessary permissions")) {
          toast({
            title: "Permission Denied",
            description: "You don't have the necessary permissions to delete your account. Please contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete account. Please try again.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} alt="User Avatar" />
                <AvatarFallback className="text-2xl">
                  {userData?.firstname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex h-7 items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{isUploadingAvatar ? 'Uploading...' : 'Upload New Picture'}</span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </Label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={`${userData?.firstname || ''} ${userData?.middlename || ''} ${userData?.lastname || ''}`.trim()}
                  onChange={(e) => {
                    const [firstname = '', middlename = '', ...lastnameParts] = e.target.value.split(' ');
                    const lastname = lastnameParts.join(' ');
                    setUserData((prev) => ({
                      ...prev,
                      firstname,
                      middlename,
                      lastname,
                      name: e.target.value.trim()
                    }));
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={userData?.studentId || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      studentId: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degreeProgram">Degree Program</Label>
                <Input
                  id="degreeProgram"
                  value={userData?.degreeProgram || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      degreeProgram: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Input
                  id="yearLevel"
                  value={userData?.yearLevel || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      yearLevel: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={userData?.section || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      section: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleEditUserData}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Changing your password helps keep your account secure. Click the button below to start the process.</p>
            <Button 
              className="w-full" 
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>Permanently delete your account and all associated data.</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog 
              onDeleteAccount={handleDeleteAccount}
              isDeleting={isDeletingAccount}
            />
          </CardContent>
        </Card>
     
      </div>
      <AlertDialogPasswordChange
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
        onConfirm={handleConfirmPasswordChange}
      />
      <footer className="py-4 text-center">
        <p className="text-sm">JESUS BE ALL THE GLORY!</p>
        <p className="text-xs mt-1">© SSG QR Attendance</p>
      </footer>
    </div>
  )
}

