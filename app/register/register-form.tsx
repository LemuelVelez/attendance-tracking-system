import { useState } from "react";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation"; // Use useRouter from Next.js

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

// Import createStudentUser from appwrite.ts
import { createStudentUser } from "@/lib/users/signup";
import Link from "next/link";

export function SignUpForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    firstname: "",
    middlename: "",
    lastname: "",
    degreeProgram: "",
    yearLevel: "",
    section: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Use the Next.js router

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        studentId: form.studentId,
        firstname: form.firstname,
        middlename: form.middlename || undefined,
        lastname: form.lastname,
        degreeProgram: form.degreeProgram,
        yearLevel: form.yearLevel,
        section: form.section || undefined,
        email: form.email,
        password: form.password,
      };

      console.log("Payload being sent to createStudentUser:", payload);

      await createStudentUser(payload);

      Swal.fire({
        icon: "success",
        title: "Account created!",
        text: "Your account has been successfully created.",
      });

      // After successful account creation, redirect to login page
      router.push("/"); // This will redirect to the login page

      setForm({
        studentId: "",
        firstname: "",
        middlename: "",
        lastname: "",
        degreeProgram: "",
        yearLevel: "",
        section: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error creating student user:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to create account",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="e.g., TC-24-A-12345"
              required
              value={form.studentId}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              type="text"
              placeholder="e.g., John"
              required
              value={form.firstname}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="middlename">Middle Name (Optional)</Label>
            <Input
              id="middlename"
              type="text"
              placeholder="e.g., Michael"
              value={form.middlename}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              type="text"
              placeholder="e.g., Doe"
              required
              value={form.lastname}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="degreeProgram">Degree Program</Label>
            <Input
              id="degreeProgram"
              type="text"
              placeholder="e.g., BS Information Systems"
              required
              value={form.degreeProgram}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yearLevel">Year Level</Label>
            <Input
              id="yearLevel"
              type="text"
              placeholder="e.g., 2nd Year"
              required
              value={form.yearLevel}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="section">Section (Optional)</Label>
            <Input
              id="section"
              type="text"
              placeholder="e.g., Section A"
              value={form.section}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={form.email}
              onChange={handleChange}
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
                value={form.password}
                onChange={handleChange}
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your Password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
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
