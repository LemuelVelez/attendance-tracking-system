"use client";

import React, { useState, useEffect } from "react";
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const users = await getAllUsers();
        setStudents(users);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again later.");
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRowLimitChange = (value: string) => {
    setStudentsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <Card className="w-full max-w-7xl mx-auto my-8 shadow-lg">
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
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              Rows per page:
            </span>
            <Select onValueChange={handleRowLimitChange} defaultValue="10">
              <SelectTrigger className="w-[70px] rounded-md">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hidden sm:table-row">
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
                <TableHead>
                  <Layers className="inline-block mr-2" />
                  Degree Program
                </TableHead>
                <TableHead>
                  <CalendarDays className="inline-block mr-2" />
                  Year
                </TableHead>
                <TableHead>
                  <LayoutGrid className="inline-block mr-2" />
                  Section
                </TableHead>
                <TableHead>
                  <UserCog className="inline-block mr-2" />
                  Role
                </TableHead>
                <TableHead>
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
                <TableRow
                  key={student.userId}
                  className="hover:bg-primary/40 transition-colors flex flex-col sm:table-row mb-4 sm:mb-0 border-b sm:border-b-0"
                >
                  <TableCell
                    className="flex justify-center items-center p-2 sm:p-4 sm:table-cell"
                    aria-label="Avatar"
                  >
                    <Avatar className="w-16 h-16 sm:w-10 sm:h-10">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="text-lg sm:text-base">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell
                    className="text-center sm:table-cell"
                    aria-label="Name"
                  >
                    <span className="font-medium">{student.name}</span>
                  </TableCell>
                  <TableCell
                    className="text-center sm:table-cell"
                    aria-label="Student ID"
                  >
                    {student.studentId}
                  </TableCell>
                  <TableCell
                    className="text-center sm:table-cell"
                    aria-label="Degree Program"
                  >
                    {student.degreeProgram}
                  </TableCell>
                  <TableCell
                    className="text-center sm:table-cell"
                    aria-label="Year"
                  >
                    {student.yearLevel}
                  </TableCell>
                  <TableCell
                    className="text-center sm:table-cell"
                    aria-label="Section"
                  >
                    {student.section}
                  </TableCell>
                  <TableCell
                    className="flex justify-center sm:table-cell"
                    aria-label="Role"
                  >
                    <Badge
                      variant={
                        student.role === "admin" ? "default" : "secondary"
                      }
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                    >
                      {student.role}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-center sm:table-cell"
                    aria-label="Email"
                  >
                    {student.email}
                  </TableCell>
                  <TableCell
                    className="flex justify-center sm:table-cell"
                    aria-label="Actions"
                  >
                    <Button
                      onClick={() =>
                        handleRoleUpdate(
                          student.userId,
                          student.role === "admin" ? "student" : "admin"
                        )
                      }
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      className="text-xs px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {isUpdating
                        ? "Updating..."
                        : student.role === "admin"
                        ? "Make Student"
                        : "Make Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => paginate(currentPage - 1)}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[
              ...Array(Math.ceil(filteredStudents.length / studentsPerPage)),
            ].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => paginate(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => paginate(currentPage + 1)}
                aria-disabled={
                  currentPage ===
                  Math.ceil(filteredStudents.length / studentsPerPage)
                }
                tabIndex={
                  currentPage ===
                  Math.ceil(filteredStudents.length / studentsPerPage)
                    ? -1
                    : undefined
                }
                className={
                  currentPage ===
                  Math.ceil(filteredStudents.length / studentsPerPage)
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}
