"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getCurrentUser,
  getPersonalFineDocuments,
  getPersonalGeneralAttendance,
  getUserAvatar,
  type FineDocument,
  type User,
  type Attendance,
} from "@/lib/personalrecords/personalrecords"
import { Calendar, CreditCard, Loader2, CheckCircle } from "lucide-react"

export function SupplyFinesManagement() {
  const [fines, setFines] = useState<FineDocument[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [events, setEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const [personalFines, generalAttendance] = await Promise.all([
            getPersonalFineDocuments(),
            getPersonalGeneralAttendance(),
          ])
          setFines(personalFines)

          const userAvatar = await getUserAvatar(user.$id)
          setAvatar(userAvatar)

          const uniqueEvents = Array.from(
            new Set(generalAttendance.map((attendance: Attendance) => attendance.eventName)),
          )
          setEvents(uniqueEvents)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
              <CardTitle className="text-2xl font-bold">{currentUser.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentUser.studentId}</p>
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
              {events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {events.map((event, index) => (
                    <Badge key={index} variant="outline" className="justify-center py-2 text-sm">
                      {event}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Events Attended Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your attendance history will appear here once you&apos;ve attended events.
                  </p>
                </div>
              )}
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
            <div className="overflow-auto h-[300px]">
              {fines.length > 0 ? (
                <>
                  {/* Hidden on small devices, visible on medium and up */}
                  <div className="hidden md:block">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Absences</th>
                          <th className="text-left p-2">Presences</th>
                          <th className="text-left p-2 min-w-[200px]">Penalties</th>
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
                                  fine.status === "Cleared" ? "bg-green-500 hover:bg-green-600 text-white" : ""
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
                              className={fine.status === "Cleared" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                            >
                              {fine.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Fines Issued</h3>
                  <p className="text-sm text-muted-foreground">
                    No fines have been generated in the system yet. Check back later for updates.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <footer className="py-4 text-center">
        <p className="text-sm">JESUS BE ALL THE GLORY!</p>
        <p className="text-xs mt-1">© SSG QR Attendance</p>
      </footer>
    </div>
  )
}
