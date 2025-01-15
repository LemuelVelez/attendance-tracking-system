import Link from "next/link";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { completePasswordRecovery } from "@/lib/auth/passwordrecovery";
import { gsap } from "gsap";

export function PasswordResetForm() {
  const { setTheme } = useTheme();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setUserId(queryParams.get("userId"));
    setSecret(queryParams.get("secret"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Password match validation
    if (newPassword !== confirmPassword) {
      setStatus("error");
      Swal.fire("Error", "Passwords do not match.", "error");
      return;
    }

    // Check password length
    if (newPassword.length < 8 || newPassword.length > 265) {
      setStatus("error");
      Swal.fire(
        "Error",
        "Password must be between 8 and 265 characters.",
        "error"
      );
      return;
    }

    // Validate against common passwords
    const commonPasswords = ["password", "123456", "qwerty", "letmein"];
    if (commonPasswords.includes(newPassword.toLowerCase())) {
      setStatus("error");
      Swal.fire("Weak Password", "Please choose a stronger password.", "error");
      return;
    }

    if (userId && secret) {
      try {
        await completePasswordRecovery(userId, secret, newPassword);
        setStatus("success");
        Swal.fire(
          "Success",
          "Your password has been successfully reset.",
          "success"
        );
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setStatus("error");
        Swal.fire("Error", errorMessage, "error");
      }
    } else {
      setStatus("error");
      Swal.fire("Error", "Reset token or user ID is missing.", "error");
    }
  };

  // Refs for GSAP animations
  const cardRef = useRef(null);
  const formRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
    );
  }, []);

  return (
    <Card ref={cardRef} className="mx-auto w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent ref={formRef}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                aria-label="Toggle New Password Visibility"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
        <footer className="py-4 text-center">
          <p className="text-sm">JESUS BE ALL THE GLORY!</p>
          <p className="text-xs mt-1">© SSG QR Attendance</p>
        </footer>
      </CardContent>
    </Card>
  );
}
