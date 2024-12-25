"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Printer,
  Download,
  Edit,
  Trash,
  Loader2,
  Calendar,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import {
  editEvent,
  deleteEvent,
  getAllEvents,
  Event,
} from "@/lib/events/eventService";
import Link from "next/link";

interface AlertState {
  isOpen: boolean;
  title: string;
  description: string;
  type: "success" | "error";
}

export default function EventDisplay() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: "",
    description: "",
    type: "success",
  });
  const [loadingActions, setLoadingActions] = useState<{
    [key: string]: "save" | "delete" | null;
  }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getAllEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setAlertState({
          isOpen: true,
          title: "Error",
          description: "Failed to fetch events. Please try again later.",
          type: "error",
        });
      }
    };

    fetchEvents();
  }, []);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handleDelete = async (id: string) => {
    setLoadingActions((prev) => ({ ...prev, [id]: "delete" }));
    try {
      await deleteEvent(id);
      setEvents(events.filter((event) => event.$id !== id));
      setAlertState({
        isOpen: true,
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      setAlertState({
        isOpen: true,
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleSave = async (updatedEvent: Event) => {
    setLoadingActions((prev) => ({ ...prev, [updatedEvent.$id]: "save" }));
    try {
      const savedEvent = await editEvent(updatedEvent.$id, updatedEvent);

      if (isEvent(savedEvent)) {
        setEvents(
          events.map((event) =>
            event.$id === savedEvent.$id ? savedEvent : event
          )
        );
        setEditingEvent(null);
        setAlertState({
          isOpen: true,
          title: "Event Updated",
          description: "The event has been successfully updated.",
          type: "success",
        });
      } else {
        throw new Error("Saved event is not of type Event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setAlertState({
        isOpen: true,
        title: "Error",
        description: "Failed to update the event. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingActions((prev) => ({ ...prev, [updatedEvent.$id]: null }));
    }
  };

  const generateQRCode = (event: Event) => {
    return JSON.stringify({
      eventName: event.eventName,
      date: event.date,
      time: event.time,
      day: event.day,
      location: event.location,
    });
  };

  const downloadQRCode = (event: Event) => {
    const svg = document.getElementById(`qr-code-${event.$id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `${event.eventName}-QR.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  const printQRCode = (event: Event) => {
    const printWindow = window.open("", "", "height=400,width=800");
    printWindow?.document.write(
      "<html><head><title>Print QR Code</title></head><body>"
    );
    printWindow?.document.write(`<h1>${event.eventName} QR Code</h1>`);
    printWindow?.document.write(
      document.getElementById(`qr-code-${event.$id}`)?.outerHTML || ""
    );
    printWindow?.document.write("</body></html>");
    printWindow?.document.close();
    printWindow?.print();
  };

  const formatEventDate = (date: string) => {
    return format(parseISO(date), "MMMM d, yyyy");
  };

  const formatEventTime = (time: string) => {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return "Invalid Time";
    }
    try {
      return format(parseISO(`2000-01-01T${time}`), "h:mm a");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid Time";
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Events Management
      </h1>
      {events.length === 0 ? (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Events Found
            </h2>
            <p className="text-gray-500 text-center mb-4">
              It looks like you haven&apos;t created any events yet. Start by
              adding your first event!
            </p>
            <Link href="/admin/create-event">
              <Button className="w-full sm:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.$id} className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {event.eventName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">
                      {event.day}, {formatEventDate(event.date)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">
                      {event.time ? formatEventTime(event.time) : "No time set"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center">
                          Event QR Code
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-inner">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                          <QRCodeSVG
                            id={`qr-code-${event.$id}`}
                            value={generateQRCode(event)}
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="rounded"
                          />
                        </div>
                        <div className="mt-6 text-center">
                          <h3 className="font-semibold text-lg mb-2">
                            {event.eventName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {event.day}, {formatEventDate(event.date)}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            {formatEventTime(event.time)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.location}
                          </p>
                        </div>
                        <div className="flex mt-6 space-x-4">
                          <Button
                            onClick={() => downloadQRCode(event)}
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download SVG
                          </Button>
                          <Button
                            onClick={() => printQRCode(event)}
                            className="flex-1"
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(event)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(event.$id)}
                  className="w-full sm:w-auto"
                  disabled={loadingActions[event.$id] === "delete"}
                >
                  {loadingActions[event.$id] === "delete" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {editingEvent && (
        <Dialog
          open={!!editingEvent}
          onOpenChange={() => setEditingEvent(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedEvent = {
                  ...editingEvent,
                  eventName: formData.get("name") as string,
                  date: formData.get("date") as string,
                  time: formData.get("time") as string,
                  day: format(parseISO(formData.get("date") as string), "EEEE"),
                  location: formData.get("location") as string,
                };
                await handleSave(updatedEvent);
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingEvent.eventName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingEvent.date}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={editingEvent.time}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingEvent.location}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loadingActions[editingEvent.$id] === "save"}
                >
                  {loadingActions[editingEvent.$id] === "save" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={alertState.isOpen}
        onOpenChange={(isOpen) =>
          setAlertState((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function isEvent(obj: unknown): obj is Event {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "$id" in obj &&
    "eventName" in obj &&
    "date" in obj &&
    "time" in obj &&
    "day" in obj &&
    "location" in obj &&
    "description" in obj
  );
}
