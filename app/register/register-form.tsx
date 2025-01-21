"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudentUser } from "@/lib/auth/signup";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SignUpForm() {
  const { setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const router = useRouter();

  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(
      formRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [id]: value }));
  };

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

      router.push("/");

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
    <Card ref={cardRef} className="mx-auto my-auto w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
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
          Create a new account by filling in the details below.
        </CardDescription>
      </CardHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <ScrollArea className="h-[30vh] ">
          <CardContent>
            <div ref={formRef}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="TC-24-A-12345"
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
                    placeholder="John"
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
                    placeholder="Michael"
                    value={form.middlename}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    type="text"
                    placeholder="Doe"
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
                    placeholder="BS Information Systems"
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
                    placeholder="2nd Year"
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
                    placeholder="Section A"
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
              </div>
            </div>
          </CardContent>
        </ScrollArea>
        <div className="max-w-[240px] lg:max-w-[332px] mx-auto">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </div>
      </form>
      <div className="mt-2 text-center text-sm">
        Already have an account?{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </div>

      <footer className="py-4 text-center">
        <p className="text-sm">JESUS BE ALL THE GLORY!</p>
        <p className="text-xs mt-1">© SSG QR Attendance</p>
      </footer>
    </Card>
  );
}
