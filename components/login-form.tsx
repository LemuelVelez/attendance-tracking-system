import { useEffect, useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert
import { useRouter } from "next/navigation"; // Import useRouter for redirection
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
import { loginStudentUser } from "@/lib/users/login"; // Import the login function
import Link from "next/link";

export function LoginForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState(""); // State for student ID
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setLoading(true); // Set loading to true when login starts

    try {
      // Call the login function
      const user = await loginStudentUser(studentId, password);
      console.log("User logged in successfully:", user);

      // Show success message with SweetAlert
      Swal.fire({
        title: "Success!",
        text: "Login successful. Welcome!",
        icon: "success",
        confirmButtonText: "Okay",
      });

      // Redirect based on user role (admin or student)
      if (user.role === "student") {
        router.push("/dashboard/student"); // Redirect to student dashboard
      } else if (user.role === "admin") {
        router.push("/dashboard/admin"); // Redirect to admin dashboard
      } else {
        // Handle any other roles or errors
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Invalid Student ID or Password. Please try again.");
      console.error("Login error:", error);

      // Show error message with SweetAlert
      Swal.fire({
        title: "Error!",
        text: "Invalid Student ID or Password. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false); // Set loading to false after the login process ends
    }
  };

  useEffect(() => {
    // Check if the URL contains the authError query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.has("authError")) {
      Swal.fire({
        title: "Unauthorized Access!",
        text: "You need to be logged in to access this page.",
        icon: "warning",
        confirmButtonText: "Okay",
      });
    }

    // Check if user is accessing /dashboard/admin without admin role
    if (window.location.pathname === "/dashboard/admin") {
      // Add your logic to check if the user has an admin role
      const userRole = localStorage.getItem("userRole"); // Replace with your role-checking logic
      if (userRole !== "admin") {
        Swal.fire({
          title: "Access Denied!",
          text: "You must be an admin to access this page.",
          icon: "error",
          confirmButtonText: "Okay",
        }).then(() => {
          router.push("/dashboard/student"); // Redirect to student dashboard or another page
        });
      }
    }
  }, [router]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Login</CardTitle>
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
          Enter your Student ID and password below to log in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              type="text"
              placeholder="e.g., TC-24-A-12345"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)} // Bind input value
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
                onChange={(e) => setPassword(e.target.value)} // Bind input value
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
          {error && <div className="text-red-500 text-sm">{error}</div>}{" "}
          {/* Display error message */}
          <Button
            type="submit"
            className="w-full"
            onClick={handleLogin}
            disabled={loading} // Disable the button while loading
          >
            {loading ? (
              <span className="animate-spin">...</span> // Simple spinner while loading
            ) : (
              "Login"
            )}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
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
