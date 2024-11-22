import Link from "next/link";
import { useState } from "react";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="rounded-md p-2 hover:bg-muted/50"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        <CardDescription>
          Create a new account by filling in the details below.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[80vh] scrollbar-hidden">
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., John Doe"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              type="text"
              placeholder="e.g., TC-24-A-12345"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="degree-program">Degree Program</Label>
            <Input
              id="degree-program"
              type="text"
              placeholder="e.g., BS Information Systems"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year-level">Year Level</Label>
            <Input
              id="year-level"
              type="text"
              placeholder="e.g., 2nd Year"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="section">Section (Optional)</Label>
            <Input id="section" type="text" placeholder="e.g., Section A" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your Password"
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                aria-label="Toggle Confirm Password Visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
