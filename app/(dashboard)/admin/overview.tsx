"use client";

import { Bar, BarChart, Line, LineChart, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample data - replace with actual data from your backend
const attendanceByEvent = [
  { event: "General Assembly", attendance: 150 },
  { event: "Leadership Workshop", attendance: 75 },
  { event: "Community Service", attendance: 100 },
  { event: "Sports Fest", attendance: 200 },
  { event: "Academic Forum", attendance: 80 },
];

const attendanceTrend = [
  { month: "Jan", attendance: 300 },
  { month: "Feb", attendance: 350 },
  { month: "Mar", attendance: 400 },
  { month: "Apr", attendance: 450 },
  { month: "May", attendance: 500 },
];

const absenceReasons = [
  { reason: "Illness", value: 30 },
  { reason: "Transportation", value: 20 },
  { reason: "Family Emergency", value: 15 },
  { reason: "Other", value: 35 },
];

const recentEvents = [
  { name: "General Assembly", date: "2023-05-15", attendance: 150, total: 180 },
  {
    name: "Leadership Workshop",
    date: "2023-05-10",
    attendance: 75,
    total: 100,
  },
  {
    name: "Community Service",
    date: "2023-05-05",
    attendance: 100,
    total: 120,
  },
  { name: "Sports Fest", date: "2023-04-30", attendance: 200, total: 250 },
  { name: "Academic Forum", date: "2023-04-25", attendance: 80, total: 100 },
];

export default function Overview() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Overview</h1>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Events This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              2 more than last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fines Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$520</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Event</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                event: { label: "Event", color: "hsl(var(--chart-1))" },
              }}
              className="w-auto h-auto"
            >
              <BarChart data={attendanceByEvent}>
                <Bar dataKey="attendance" fill="var(--color-event)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attendance: {
                  label: "Attendance",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="w-auto h-auto"
            >
              <LineChart data={attendanceTrend}>
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="var(--color-attendance)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Absence Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                reason: { label: "Reason", color: "hsl(var(--chart-3))" },
                value: { label: "Value", color: "hsl(var(--chart-4))" },
              }}
              className="h-auto w-auto"
            >
              <PieChart>
                <Pie
                  data={absenceReasons}
                  dataKey="value"
                  nameKey="reason"
                  fill="var(--color-reason)"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event.name}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>
                      {event.attendance}/{event.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
