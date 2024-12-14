import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCurrentSessionUser,
  changePassword,
  editUserData,
  getUserAvatar,
  setUserAvatar,
} from "@/lib/profile/profile";
import { Upload, Eye, EyeOff } from "lucide-react";

// Define the structure of userData
interface UserData {
  name?: string;
  email?: string;
  studentId?: string;
  degreeProgram?: string;
  yearLevel?: string;
  section?: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user data and avatar on component mount
  React.useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await getCurrentSessionUser();
        const userData: UserData = {
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          degreeProgram: user.degreeProgram,
          yearLevel: user.yearLevel,
          section: user.section,
        };
        setUserData(userData);

        const avatar = await getUserAvatar();
        setAvatarUrl(avatar);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch user data or avatar.", "error");
        console.error("Error fetching user data or avatar:", error);
      }
    }
    fetchUserData();
  }, []);

  // Handle updating user data
  const handleEditUserData = async () => {
    if (!userData) return;

    try {
      await editUserData(userData);
      Swal.fire("Success", "Profile updated successfully.", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire(
        "Error",
        "Failed to update profile. Please try again.",
        "error"
      );
    }
  };

  // Handle uploading and setting a new avatar
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newAvatarUrl = await setUserAvatar(file);
      setAvatarUrl(newAvatarUrl);
      Swal.fire("Success", "Avatar updated successfully.", "success");
    } catch (error) {
      console.error("Error updating avatar:", error);
      Swal.fire("Error", "Failed to update avatar. Please try again.", "error");
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Swal.fire(
        "Error",
        "New password and confirm password do not match.",
        "error"
      );
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      Swal.fire("Success", "Password changed successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire(
        "Error",
        "Failed to change password. Please try again.",
        "error"
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Avatar className="w-auto h-auto">
                  <AvatarImage src={avatarUrl || undefined} alt="User Avatar" />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>

                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                      <Upload className="w-5 h-5" />
                      <span>Upload New Profile Picture</span>
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
              </div>
              <div></div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={userData?.name || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={userData?.email || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  defaultValue={userData?.studentId || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, studentId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degreeProgram">Degree Program</Label>
                <Input
                  id="degreeProgram"
                  defaultValue={userData?.degreeProgram || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, degreeProgram: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Input
                  id="yearLevel"
                  defaultValue={userData?.yearLevel || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, yearLevel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  defaultValue={userData?.section || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, section: e.target.value })
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
        <Card>
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
                <span
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </span>
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
                <span
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </span>
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
                <span
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </span>
              </div>
            </div>
            <Button className="w-full" onClick={handleChangePassword}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
