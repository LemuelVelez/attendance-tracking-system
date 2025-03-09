import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
import { gsap } from "gsap";

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
    <Card ref={cardRef} className="mx-auto max-w-sm">
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
      <CardContent ref={formRef}>
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
            className={`mt-4 text-center text-sm ${status === "success" ? "text-green-600" : "text-red-600"
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
        <footer role="contentinfo" className="pt-4 pb-2 text-center text-xs">
          <p className="font-bold">JESUS BE ALL THE GLORY!</p>
          <p className="mt-1">© SSG QR Attendance</p>
          <small className="block mt-1 text-muted-foreground">
            © {new Date().getFullYear()} Lemuel Velez. Open-source under the{" "}
            <a
              href="http://www.apache.org/licenses/LICENSE-2.0"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apache 2.0 License
            </a>
            . No unauthorized patenting allowed.
          </small>
        </footer>
      </CardContent>
    </Card>
  );
}
