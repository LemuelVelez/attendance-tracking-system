import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";

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

// Import the sendPasswordRecovery function
import { sendPasswordRecovery } from "@/lib/auth/passwordrecovery";

export function PasswordRecoveryForm() {
  const { setTheme } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      // Call the password recovery function
      await sendPasswordRecovery(email);
      setStatus("success");
      setMessage("Password recovery email has been sent!");
    } catch (error) {
      // Ensure type safety for the error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while sending the email.";
      setStatus("error");
      setMessage(errorMessage);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Password Recovery</CardTitle>
          {/* Theme toggle dropdown */}
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
        <CardDescription>
          Enter your email address to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        {message && (
          <div
            className={`mt-4 text-center text-sm ${
              status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
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
