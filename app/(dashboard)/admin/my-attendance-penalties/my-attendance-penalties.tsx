"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getCurrentUser,
  getPersonalFineDocuments,
  getPersonalGeneralAttendance,
  getUserAvatar,
  FineDocument,
  User,
  Attendance,
} from "@/lib/personalrecords/personalrecords";
import { Calendar, CreditCard } from "lucide-react";

export function SupplyFinesManagement() {
  const [fines, setFines] = useState<FineDocument[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const [personalFines, generalAttendance] = await Promise.all([
            getPersonalFineDocuments(),
            getPersonalGeneralAttendance(),
          ]);
          setFines(personalFines);

          const userAvatar = await getUserAvatar(user.$id);
          setAvatar(userAvatar);

          const uniqueEvents = Array.from(
            new Set(
              generalAttendance.map(
                (attendance: Attendance) => attendance.eventName
              )
            )
          );
          setEvents(uniqueEvents);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage src={avatar || undefined} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {currentUser.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentUser.studentId}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Total Events Attended: {events.length}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {events.map((event, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="justify-center py-2 text-sm"
                  >
                    {event}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Fines Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              {/* Hidden on small devices, visible on medium and up */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Absences</th>
                      <th className="text-left p-2">Presences</th>
                      <th className="text-left p-2">Penalties</th>
                      <th className="text-left p-2 min-w-28">Date Issued</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine.$id}>
                        <td className="p-2">{fine.absences}</td>
                        <td className="p-2">{fine.presences}</td>
                        <td className="p-2">{fine.penalties}</td>
                        <td className="p-2">{fine.dateIssued}</td>
                        <td className="p-2">
                          <Badge
                            variant={
                              fine.status === "Cleared"
                                ? "default"
                                : fine.status === "Pending"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              fine.status === "Cleared"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : ""
                            }
                          >
                            {fine.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Visible on small devices, hidden on medium and up */}
              <div className="md:hidden">
                {fines.map((fine) => (
                  <div key={fine.$id} className="mb-4 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-semibold">Absences:</div>
                      <div>{fine.absences}</div>
                      <div className="font-semibold">Presences:</div>
                      <div>{fine.presences}</div>
                      <div className="font-semibold">Penalties:</div>
                      <div>{fine.penalties}</div>
                      <div className="font-semibold">Date Issued:</div>
                      <div>{fine.dateIssued}</div>
                      <div className="font-semibold">Status:</div>
                      <div>
                        <Badge
                          variant={
                            fine.status === "Cleared"
                              ? "default"
                              : fine.status === "Pending"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            fine.status === "Cleared"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : ""
                          }
                        >
                          {fine.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
