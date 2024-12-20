"use client";

import React, { useState } from "react";
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

// Mock data for events (unchanged)
const mockEvents = [
  {
    id: 1,
    name: "Tech Conference 2023",
    date: "2023-09-15",
    time: "09:00",
    day: "Friday",
    location: "Convention Center",
  },
  {
    id: 2,
    name: "Startup Meetup",
    date: "2023-09-20",
    time: "18:00",
    day: "Wednesday",
    location: "Coworking Space",
  },
  {
    id: 3,
    name: "AI Workshop",
    date: "2023-09-25",
    time: "14:00",
    day: "Monday",
    location: "University Auditorium",
  },
];

// Interfaces (unchanged)
interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  day: string;
  location: string;
}

interface AlertState {
  isOpen: boolean;
  title: string;
  description: string;
  type: "success" | "error";
}

export default function EventDisplay() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: "",
    description: "",
    type: "success",
  });

  // Event handling functions (unchanged)
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handleDelete = (id: number) => {
    setEvents(events.filter((event) => event.id !== id));
    setAlertState({
      isOpen: true,
      title: "Event Deleted",
      description: "The event has been successfully deleted.",
      type: "success",
    });
  };

  const handleSave = (updatedEvent: Event) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setEditingEvent(null);
    setAlertState({
      isOpen: true,
      title: "Event Updated",
      description: "The event has been successfully updated.",
      type: "success",
    });
  };

  const generateQRCode = (event: Event) => {
    return JSON.stringify({
      name: event.name,
      date: event.date,
      time: event.time,
      day: event.day,
      location: event.location,
    });
  };

  const downloadQRCode = (event: Event) => {
    const svg = document.getElementById(`qr-code-${event.id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${event.name}-QR.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const printQRCode = (event: Event) => {
    const printWindow = window.open("", "", "height=400,width=800");
    printWindow?.document.write(
      "<html><head><title>Print QR Code</title></head><body>"
    );
    printWindow?.document.write(`<h1>${event.name} QR Code</h1>`);
    printWindow?.document.write(
      document.getElementById(`qr-code-${event.id}`)?.outerHTML || ""
    );
    printWindow?.document.write("</body></html>");
    printWindow?.document.close();
    printWindow?.print();
  };

  const formatEventDate = (date: string) => {
    return format(parseISO(date), "MMMM d, yyyy");
  };

  const formatEventTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), "h:mm a");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Events Management
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{event.name}</CardTitle>
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
                  <span className="text-sm">{formatEventTime(event.time)}</span>
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
                          id={`qr-code-${event.id}`}
                          value={generateQRCode(event)}
                          size={200}
                          level="H"
                          includeMargin={true}
                          className="rounded"
                        />
                      </div>
                      <div className="mt-6 text-center">
                        <h3 className="font-semibold text-lg mb-2">
                          {event.name}
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
                          Download
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
                onClick={() => handleDelete(event.id)}
                className="w-full sm:w-auto"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedEvent = {
                  ...editingEvent,
                  name: formData.get("name") as string,
                  date: formData.get("date") as string,
                  time: formData.get("time") as string,
                  day: format(parseISO(formData.get("date") as string), "EEEE"),
                  location: formData.get("location") as string,
                };
                handleSave(updatedEvent);
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingEvent.name}
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
                <Button type="submit" className="w-full">
                  Save Changes
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
