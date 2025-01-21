"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllData,
  User,
  Event,
  Attendance,
  FineDocument,
} from "@/lib/overview/overview";
import {
  Loader2,
  Users,
  BarChartIcon,
  Calendar,
  DollarSign,
  TrendingUp,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Notification from "@/components/notification";

interface OverviewData {
  users: User[];
  events: Event[];
  attendance: Attendance[];
  fines: FineDocument[];
}

const MotionCard = motion(Card);

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await getAllData();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No data available.
        </div>
      </div>
    );
  }

  const totalStudents = data.users.length;
  const totalEvents = new Set(data.attendance.map((a) => a.eventName)).size;
  const totalAttendance = data.attendance.length;
  const averageAttendance =
    totalEvents > 0
      ? ((totalAttendance / (totalEvents * totalStudents)) * 100).toFixed(2)
      : 0;

  const totalFinesCleared = data.fines.filter(
    (fine) => fine.status === "Cleared" || fine.status === "penaltyCleared"
  ).length;

  const attendanceByEvent = Array.from(
    data.attendance.reduce((acc, curr) => {
      const count = acc.get(curr.eventName) || 0;
      acc.set(curr.eventName, count + 1);
      return acc;
    }, new Map<string, number>())
  )
    .map(([event, attendance]) => ({ event, attendance }))
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 10);

  const attendanceTrend = data.attendance
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString();
      const existingEntry = acc.find((entry) => entry.date === date);
      if (existingEntry) {
        existingEntry.attendance += 1;
      } else {
        acc.push({ date, attendance: 1 });
      }
      return acc;
    }, [] as { date: string; attendance: number }[]);

  const recentEvents = data.attendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((acc, curr) => {
      if (!acc.some((event) => event.eventName === curr.eventName)) {
        acc.push({
          eventName: curr.eventName,
          date: new Date(curr.date).toLocaleDateString(),
          attendance: data.attendance.filter(
            (a) => a.eventName === curr.eventName
          ).length,
          total: totalStudents,
        });
      }
      return acc;
    }, [] as { eventName: string; date: string; attendance: number; total: number }[]);

  const totalPages = Math.ceil(recentEvents.length / rowsPerPage);
  const paginatedEvents = recentEvents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-4 sm:p-8 space-y-4 sm:space-y-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {" "}
          <Notification />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Overview
        </h1>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mt-4 sm:mt-8">
          <AnimatePresence>
            {[
              { title: "Total Users", value: totalStudents, icon: Users },
              {
                title: "Average Attendance",
                value: `${averageAttendance}%`,
                icon: BarChartIcon,
              },
              { title: "Total Events", value: totalEvents, icon: Calendar },
              {
                title: "Total Fines Cleared",
                value: totalFinesCleared,
                icon: DollarSign,
              },
            ].map((item, index) => (
              <MotionCard
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="overflow-hidden bg-card hover:bg-card/90 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <item.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {item.value}
                  </div>
                </CardContent>
              </MotionCard>
            ))}
          </AnimatePresence>
        </div>

        {/* Charts */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mt-8 sm:mt-12">
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card hover:bg-card/90 transition-colors"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">
                Top Events by Attendance
              </CardTitle>
              <BarChartIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={attendanceByEvent}
                    margin={{ top: 20, right: 10, left: 0, bottom: 70 }}
                  >
                    <XAxis
                      dataKey="event"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 10, fill: "currentColor" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "currentColor" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                    <Bar dataKey="attendance" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </MotionCard>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-card hover:bg-card/90 transition-colors"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">
                Attendance Trend
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={attendanceTrend}
                    margin={{ top: 20, right: 10, left: 0, bottom: 70 }}
                  >
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 10, fill: "currentColor" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "currentColor" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </MotionCard>
        </div>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-card hover:bg-card/90 transition-colors mt-8 sm:mt-12"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg sm:text-xl font-semibold text-primary">
              Recent Events
            </CardTitle>
            <List className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] sm:w-[250px]">
                      Event
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvents.map((event) => (
                    <TableRow
                      key={event.eventName}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {event.eventName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {event.date}
                      </TableCell>
                      <TableCell>
                        {event.attendance}/{event.total}
                      </TableCell>
                      <TableCell className="text-right">
                        {((event.attendance / event.total) * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows per page</SelectItem>
                  <SelectItem value="20">20 rows per page</SelectItem>
                  <SelectItem value="50">50 rows per page</SelectItem>
                </SelectContent>
              </Select>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i} className="hidden sm:inline-block">
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </MotionCard>
      </div>
      <footer className="py-4 text-center">
        <p className="text-sm">JESUS BE ALL THE GLORY!</p>
        <p className="text-xs mt-1">© SSG QR Attendance</p>
      </footer>
    </div>
  );
}
