"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllUsers, updateUserRole, Student } from "@/lib/users/userService";
import {
  Users,
  UserCircle,
  GraduationCap,
  CalendarDays,
  Layers,
  UserCog,
  Mail,
  Settings,
  Search,
  LayoutGrid,
  Loader2,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortConfig = {
  key: keyof Student;
  direction: "asc" | "desc";
} | null;

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const users = await getAllUsers();
        setStudents(users);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again later.");
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load students. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchStudents();
  }, [toast]);

  const handleRoleUpdate = async (
    userId: string,
    newRole: "admin" | "student"
  ) => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateUserRole(userId, newRole);
      setStudents(
        students.map((student) =>
          student.userId === userId ? { ...student, role: newRole } : student
        )
      );
      toast({
        title: "Role updated successfully",
        description: `User role has been changed to ${newRole}.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  const openConfirmDialog = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const sortedStudents = useMemo(() => {
    const sortableStudents = [...students];
    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  const filteredStudents = useMemo(() => {
    return sortedStudents.filter((student) =>
      Object.values(student).some((value) =>
        String(value)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedStudents, searchTerm]);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = useMemo(() => {
    return filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  }, [filteredStudents, indexOfFirstStudent, indexOfLastStudent]);

  const paginate = (pageNumber: number) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(filteredStudents.length / studentsPerPage)
    ) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowLimitChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
      setStudentsPerPage(newLimit);
      setCurrentPage(1);
    } else {
      console.error("Invalid row limit:", value);
      toast({
        title: "Error",
        description: "Invalid row limit selected.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (value: string) => {
    const [key, direction] = value.split("-") as [
      keyof Student,
      "asc" | "desc"
    ];
    setSortConfig({ key, direction });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <Card className="w-full mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-7xl my-8 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/95 to-purple-600">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Student List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search all fields"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Sort By <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={`${sortConfig?.key}-${sortConfig?.direction}`}
                  onValueChange={handleSort}
                >
                  <DropdownMenuRadioItem value="name-asc">
                    Name (A-Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">
                    Name (Z-A)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="studentId-asc">
                    Student ID (Ascending)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="studentId-desc">
                    Student ID (Descending)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="yearLevel-asc">
                    Year (Ascending)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="yearLevel-desc">
                    Year (Descending)
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm font-medium text-gray-600">Rows:</span>
            <Select onValueChange={handleRowLimitChange} defaultValue="10">
              <SelectTrigger className="w-[65px] rounded-md">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
                <SelectItem value="10000">10,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader className="hidden sm:table-header-group">
              <TableRow>
                <TableHead className="w-[90px]">
                  <UserCircle className="inline-block mr-2" />
                  Avatar
                </TableHead>
                <TableHead>
                  <Users className="inline-block mr-2" />
                  Name
                </TableHead>
                <TableHead>
                  <GraduationCap className="inline-block mr-2" />
                  Student ID
                </TableHead>
                <TableHead className="w-[155px]">
                  <Layers className="inline-block mr-2" />
                  Degree Program
                </TableHead>
                <TableHead className="w-[90px]">
                  <CalendarDays className="inline-block mr-2" />
                  Year
                </TableHead>
                <TableHead className="w-[95px]">
                  <LayoutGrid className="inline-block mr-2" />
                  Section
                </TableHead>
                <TableHead className="w-[90px]">
                  <UserCog className="inline-block mr-2" />
                  Role
                </TableHead>
                <TableHead className="w-[10px]">
                  <Mail className="inline-block mr-2" />
                  Email
                </TableHead>
                <TableHead>
                  <Settings className="inline-block mr-2" />
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStudents.map((student) => (
                <React.Fragment key={student.userId}>
                  {/* Desktop view */}
                  <TableRow className="hidden sm:table-row hover:bg-primary/40 transition-colors">
                    <TableCell className="font-medium">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.degreeProgram}</TableCell>
                    <TableCell>{student.yearLevel}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {student.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => openConfirmDialog(student)}
                        variant="outline"
                        size="sm"
                        className={`${
                          isUpdating ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isUpdating
                          ? "Updating..."
                          : student.role === "admin"
                          ? "Make Student"
                          : "Make Admin"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {/* Mobile view */}
                  <TableRow className="sm:hidden flex flex-col p-4 border-b hover:bg-primary/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge
                        variant={
                          student.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {student.role}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {student.name}
                      </p>
                      <p>
                        <span className="font-semibold">Student ID:</span>{" "}
                        {student.studentId}
                      </p>
                      <p>
                        <span className="font-semibold">Degree:</span>{" "}
                        {student.degreeProgram}
                      </p>
                      <p>
                        <span className="font-semibold">Year:</span>{" "}
                        {student.yearLevel}
                      </p>
                      <p>
                        <span className="font-semibold">Section:</span>{" "}
                        {student.section}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {student.email}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => openConfirmDialog(student)}
                        variant="outline"
                        size="sm"
                        className={`w-full ${
                          isUpdating ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isUpdating
                          ? "Updating..."
                          : student.role === "admin"
                          ? "Make Student"
                          : "Make Admin"}
                      </Button>
                    </div>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <Pagination>
            <PaginationContent>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">First page</span>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <div className="text-sm text-gray-600 sm:hidden">
                  Page {currentPage} of{" "}
                  {Math.ceil(filteredStudents.length / studentsPerPage)}
                </div>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Page {currentPage} of{" "}
                  {Math.ceil(filteredStudents.length / studentsPerPage)}
                </span>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredStudents.length / studentsPerPage)
                    }
                  >
                    <span className="sr-only">Next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    onClick={() =>
                      paginate(
                        Math.ceil(filteredStudents.length / studentsPerPage)
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredStudents.length / studentsPerPage)
                    }
                  >
                    <span className="sr-only">Last page</span>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </div>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {selectedStudent?.name}&apos;s
              role from {selectedStudent?.role} to{" "}
              {selectedStudent?.role === "admin" ? "student" : "admin"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedStudent &&
                handleRoleUpdate(
                  selectedStudent.userId,
                  selectedStudent.role === "admin" ? "student" : "admin"
                )
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>{" "}
      <footer className="py-4 text-center">
        <p className="text-sm">JESUS BE ALL THE GLORY!</p>
        <p className="text-xs mt-1">© SSG QR Attendance</p>
      </footer>
    </Card>
  );
}
