import Link from "next/link";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

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

export function PasswordRecoveryForm() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Password Recovery</CardTitle>
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-md hover:bg-muted/50"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        <CardDescription>
          Enter your email address to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
