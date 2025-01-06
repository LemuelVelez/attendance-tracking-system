"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import {
  getGeneralAttendance,
  createFineDocument,
  getFineDocuments,
  getTotalUniqueEvents,
  getAllUsers,
  FineDocument,
  Attendance,
  FineDocumentData,
  User,
} from "@/lib/GeneralAttendance/GeneralAttendance";

const PENALTIES_MAP: Record<number, string> = {
  0: "No penalty",
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

export default function SupplyFinesManagement() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [fines, setFines] = useState<FineDocument[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("All Events");
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const calculateFines = useCallback(async () => {
    const userAttendances = attendances.reduce((acc, attendance) => {
      if (
        selectedEvent === "All Events" ||
        attendance.eventName === selectedEvent
      ) {
        acc[attendance.userId] = (acc[attendance.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const newFines: FineDocument[] = [];

    for (const user of allUsers) {
      const attended = userAttendances[user.$id] || 0;
      const absences = Math.max(0, totalEvents - attended);
      const presences = attended;

      const penalties = PENALTIES_MAP[absences] || PENALTIES_MAP[10];

      const fineData: FineDocumentData = {
        userId: user.$id,
        studentId: user.studentId,
        name: user.name,
        absences: absences.toString(),
        presences: presences.toString(),
        penalties,
        dateIssued: new Date().toISOString().split("T")[0],
        status: penalties === "No penalty" ? "Cleared" : "Pending",
      };

      try {
        const createdFine = await createFineDocument(fineData);
        newFines.push(createdFine);
      } catch (error) {
        console.error("Error creating fine document:", error);
        continue;
      }
    }

    setFines((prevFines) => {
      const updatedFines = [...prevFines];
      for (const newFine of newFines) {
        const index = updatedFines.findIndex((f) => f.$id === newFine.$id);
        if (index !== -1) {
          updatedFines[index] = newFine;
        } else {
          updatedFines.push(newFine);
        }
      }
      return updatedFines;
    });
  }, [allUsers, attendances, selectedEvent, totalEvents]);

  useEffect(() => {
    calculateFines();
  }, [allUsers, attendances, selectedEvent, totalEvents, calculateFines]);

  const fetchData = async () => {
    try {
      const attendanceData = await getGeneralAttendance();
      setAttendances(attendanceData);

      const finesData = await getFineDocuments();
      setFines(finesData);

      const totalEventsCount = await getTotalUniqueEvents();
      setTotalEvents(totalEventsCount);

      const usersData = await getAllUsers();
      setAllUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmitSupplies = async (id: string) => {
    try {
      const fineToUpdate = fines.find((fine) => fine.$id === id);
      if (!fineToUpdate) return;

      const updatedFineData: FineDocumentData = {
        userId: fineToUpdate.userId,
        studentId: fineToUpdate.studentId,
        name: fineToUpdate.name,
        absences: fineToUpdate.absences,
        presences: fineToUpdate.presences,
        penalties: fineToUpdate.penalties,
        dateIssued: fineToUpdate.dateIssued,
        status: "Cleared",
        datePaid: new Date().toISOString().split("T")[0],
      };

      const updatedFineDocument = await createFineDocument(updatedFineData);
      setFines((prev) =>
        prev.map((fine) => (fine.$id === id ? updatedFineDocument : fine))
      );
    } catch (error) {
      console.error("Error updating fine document:", error);
    }
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
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total number of required events: {totalEvents}</p>
        </CardContent>
      </Card>

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
                <TableHead>Presences</TableHead>
                <TableHead>Absences</TableHead>
                <TableHead>Required Supplies</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.map((fine) => {
                const presences =
                  selectedEvent === "All Events"
                    ? parseInt(fine.presences)
                    : attendances.filter(
                        (a) =>
                          a.userId === fine.userId &&
                          a.eventName === selectedEvent
                      ).length;

                return (
                  <TableRow key={fine.$id}>
                    <TableCell>{fine.studentId}</TableCell>
                    <TableCell>{fine.name}</TableCell>
                    <TableCell>{presences}</TableCell>
                    <TableCell>{fine.absences}</TableCell>
                    <TableCell className="max-w-md whitespace-normal">
                      {fine.penalties}
                    </TableCell>
                    <TableCell>{fine.dateIssued}</TableCell>
                    <TableCell>{fine.status}</TableCell>
                    <TableCell>
                      {fine.status === "Pending" ? (
                        <Button onClick={() => handleSubmitSupplies(fine.$id)}>
                          Mark as Cleared
                        </Button>
                      ) : fine.status === "Cleared" ? (
                        <span className="text-green-600 font-semibold">
                          Cleared
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
