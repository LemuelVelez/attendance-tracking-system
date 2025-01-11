"use client"

import { useState, useEffect } from "react"
import { Upload, Eye, EyeOff } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"

import {
  getCurrentSessionUser,
  changePassword,
  editUserData,
  getUserAvatar,
  setUserAvatar,
  deleteAccount,
  type UserData,
} from "@/lib/profile/profile"

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await getCurrentSessionUser()
        const userData: UserData = {
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          degreeProgram: user.degreeProgram,
          yearLevel: user.yearLevel,
          section: user.section,
        }
        setUserData(userData)

        const avatar = await getUserAvatar()
        setAvatarUrl(avatar)
      } catch (error) {
        console.error("Error fetching user data or avatar:", error)
      }
    }
    fetchUserData()
  }, [])

  const handleEditUserData = async () => {
    if (!userData) return

    try {
      await editUserData(userData)
      alert("Profile updated successfully.")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const newAvatarUrl = await setUserAvatar(file)
      setAvatarUrl(newAvatarUrl)
      alert("Avatar updated successfully.")
    } catch (error) {
      console.error("Error updating avatar:", error)
      alert("Failed to update avatar. Please try again.")
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.")
      return
    }
    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      alert("Password changed successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (password: string) => {
    setIsDeletingAccount(true)
    try {
      await deleteAccount(password)
      alert("Your account has been deleted.")
      // Redirect to home page or login page after successful deletion
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting account:', error)
      alert("Failed to delete account. Please try again.")
    } finally {
      setIsDeletingAccount(false)
    }
  }

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
                  {userData?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex h-7 items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                  <Upload className="h-4 w-4" />
                  <span>Upload New Picture</span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </Label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userData?.name || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
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
            <Button className="w-full" onClick={handleEditUserData}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
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
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
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
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
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
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
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
      <footer className="py-4 text-center">
        <p className="text-sm">JESUS BE ALL THE GLORY!</p>
        <p className="text-xs mt-1">© SSG QR Attendance</p>
      </footer>
    </div>
  )
}

