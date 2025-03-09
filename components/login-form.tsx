import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Eye, EyeOff, Loader } from "lucide-react";
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
import { loginStudentUser, getActiveSession } from "@/lib/auth/login";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { gsap } from "gsap";
import { ErrorInfoDialog } from "./ErrorInfoDialog";

export function LoginForm() {
  const { setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Refs for GSAP animations
  const cardRef = useRef(null);
  const formRef = useRef(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

  // Check active session and redirect based on role
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const activeSession = await getActiveSession();
        if (activeSession) {
          const userRole = activeSession.user.role;

          if (userRole === "student") {
            router.push("/student");
          } else if (userRole === "admin") {
            router.push("/admin");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkActiveSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const user = await loginStudentUser(studentId, password);
      Swal.fire({
        title: "Success!",
        text: "Login successful. Welcome!",
        icon: "success",
        confirmButtonText: "Okay",
      });

      // Redirect based on user role
      if (user.role === "student") {
        router.push("/student");
      } else if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Invalid Student ID or Password. Please try again."
      );
      Swal.fire({
        title: "Error!",
        text:
          error instanceof Error
            ? error.message
            : "Invalid Student ID or Password. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card ref={cardRef} className="mx-auto max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Login</CardTitle>
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
          Enter your Student ID and password below to log in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              type="text"
              placeholder="TC-24-A-12345"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/recover"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          {errorMessage && (
            <div className="text-red-500 text-sm" role="alert">
              {errorMessage}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader className="animate-spin h-5 w-5 mx-auto" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
        <div className="mt-4 text-center">
          <ErrorInfoDialog />
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
