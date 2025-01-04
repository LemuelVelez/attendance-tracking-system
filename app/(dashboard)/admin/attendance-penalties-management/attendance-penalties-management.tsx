/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface Attendance {
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: string;
  section: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
}

interface Fine {
  id: number;
  userId: string;
  studentId: string;
  name: string;
  absences: number;
  penalties: string;
  dateIssued: string;
  datePaid?: string;
  status: "Pending" | "Submitted";
}

// Penalties configuration based on number of absences
const PENALTIES_MAP: Record<number, string> = {
  1: "1 pad grade 1 paper, 1 pencil",
  2: "2 pads Grade 2 paper, 2 pencils, 1 eraser",
  3: "3 Pads Grade 3 paper, 3 pencils, 2 eraser, 1 sharpener",
  4: "2 pads grade 4 paper 2 pencils, 2 ball pen, 1 crayon, 1 sharpener, 1 eraser",
  5: "2 Pads intermediate paper, 2 notebooks, 2 ball pen, 1 crayon",
  6: "2 Pads intermediate paper, 2 notebooks, 2 ball pen, 1 crayon, 2 pencils",
  7: "1 plastic envelop with handle, 2 Pads intermediate paper, 2 notebooks",
  8: "1 plastic envelop with handle, 2 Pads intermediate paper, 2 notebooks",
  9: "1 plastic envelop with handle, 2 Pads intermediate paper, 3 notebooks 2 pencils, 2 eraser, 1 sharpener",
  10: "1 plastic envelop with handle, 2 Pads intermediate paper, 3 notebooks 3 pencils, 2 eraser, 3 sharpener, 3 ball pen, 1 crayon",
};

// Mock Data
const mockAttendances: Attendance[] = [
  {
    userId: "1",
    studentId: "S001",
    name: "John Doe",
    degreeProgram: "Computer Science",
    yearLevel: "3",
    section: "A",
    eventName: "Orientation",
    location: "Main Hall",
    date: "2023-08-01",
    day: "Monday",
    time: "09:00",
  },
  {
    userId: "2",
    studentId: "S002",
    name: "Jane Smith",
    degreeProgram: "Engineering",
    yearLevel: "2",
    section: "B",
    eventName: "Orientation",
    location: "Main Hall",
    date: "2023-08-01",
    day: "Monday",
    time: "09:00",
  },
  {
    userId: "3",
    studentId: "S003",
    name: "Bob Johnson",
    degreeProgram: "Business",
    yearLevel: "4",
    section: "C",
    eventName: "Career Fair",
    location: "Gym",
    date: "2023-08-15",
    day: "Tuesday",
    time: "14:00",
  },
];

export default function SupplyFinesManagement() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [attendances, setAttendances] = useState<Attendance[]>(mockAttendances);
  const [fines, setFines] = useState<Fine[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("All Events");
  const [nextId, setNextId] = useState(1);
  const totalEvents = 10; // Total number of required events

  useEffect(() => {
    calculateFines();
  }, [attendances, selectedEvent]);

  const calculateFines = () => {
    const userAttendances = attendances.reduce((acc, attendance) => {
      if (
        selectedEvent === "All Events" ||
        attendance.eventName === selectedEvent
      ) {
        acc[attendance.userId] = (acc[attendance.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const uniqueStudents = [...new Set(attendances.map((a) => a.userId))];
    const newFines: Fine[] = uniqueStudents
      .map((userId) => {
        const student = attendances.find((a) => a.userId === userId);
        if (!student) return null;

        const attended = userAttendances[userId] || 0;
        const absences = totalEvents - attended;
        const penalties = PENALTIES_MAP[absences] || PENALTIES_MAP[10]; // Use maximum penalties if absences > 10

        const fine: Fine = {
          id: nextId + uniqueStudents.indexOf(userId),
          userId,
          studentId: student.studentId,
          name: student.name,
          absences,
          penalties,
          dateIssued: new Date().toISOString().split("T")[0],
          status: "Pending",
        };
        return fine;
      })
      .filter((fine): fine is Fine => fine !== null);

    setFines(newFines);
    setNextId(nextId + uniqueStudents.length);
  };

  const handleSubmitSupplies = (id: number) => {
    setFines((prev) =>
      prev.map((fine) =>
        fine.id === id
          ? {
              ...fine,
              status: "Submitted",
              datePaid: new Date().toISOString().split("T")[0],
            }
          : fine
      )
    );
  };

  const uniqueEvents = [
    "All Events",
    ...new Set(attendances.map((a) => a.eventName)),
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Attendance Penalties Management
      </h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Event Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedEvent} defaultValue={selectedEvent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {uniqueEvents.map((event) => (
                <SelectItem key={event} value={event}>
                  {event}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Supplies List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Absences</TableHead>
                <TableHead>Required Supplies</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.map((fine) => (
                <TableRow key={fine.id}>
                  <TableCell>{fine.studentId}</TableCell>
                  <TableCell>{fine.name}</TableCell>
                  <TableCell>{fine.absences}</TableCell>
                  <TableCell className="max-w-md whitespace-normal">
                    {fine.penalties}
                  </TableCell>
                  <TableCell>{fine.dateIssued}</TableCell>
                  <TableCell>{fine.status}</TableCell>
                  <TableCell>
                    {fine.status === "Pending" && (
                      <Button onClick={() => handleSubmitSupplies(fine.id)}>
                        Mark as Submitted
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
