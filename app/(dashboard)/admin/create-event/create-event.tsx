"use client";

import { useState } from "react";
import { CalendarIcon, Clock, MapPin, Loader2 } from "lucide-react";
import { createEvent } from "@/lib/events/eventService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormField {
  value: string;
  error: string | null;
}

export default function CreateEvent() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  } | null>(null);
  const [formFields, setFormFields] = useState<{ [key: string]: FormField }>({
    eventName: { value: "", error: null },
    eventTime: { value: "", error: null },
    location: { value: "", error: null },
    description: { value: "", error: null },
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: { ...prev[field], value, error: null },
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newFormFields = { ...formFields };

    if (!formFields.eventName.value) {
      newFormFields.eventName.error = "Event name is required";
      isValid = false;
    }

    if (!date) {
      isValid = false;
      setAlertDialog({
        isOpen: true,
        title: "Error",
        description: "Please select a date for the event.",
      });
    }

    if (!formFields.eventTime.value) {
      newFormFields.eventTime.error = "Event time is required";
      isValid = false;
    }

    if (!formFields.location.value) {
      newFormFields.location.error = "Location is required";
      isValid = false;
    }

    setFormFields(newFormFields);
    return isValid;
  };

  const handleCreateEvent = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        if (!date) {
          throw new Error("Date is required");
        }

        // Format the date components directly, preserving the exact selected date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        // Log the date components for verification
        console.log("Selected date:", date);
        console.log("Formatted date:", formattedDate);

        const eventData = {
          eventName: formFields.eventName.value,
          date: formattedDate,
          time: formFields.eventTime.value,
          day: date.toLocaleDateString("en-US", { weekday: "long" }),
          location: formFields.location.value,
          description: formFields.description.value,
        };

        const createdEvent = await createEvent(eventData);

        setAlertDialog({
          isOpen: true,
          title: "Success",
          description: `Event "${
            createdEvent.eventName
          }" created successfully for ${createdEvent.date} at ${formatTime(
            createdEvent.time
          )}!`,
        });

        console.log("Created event:", createdEvent);

        // Reset form after successful creation
        setDate(undefined);
        setFormFields({
          eventName: { value: "", error: null },
          eventTime: { value: "", error: null },
          location: { value: "", error: null },
          description: { value: "", error: null },
        });
      } catch (error) {
        console.error("Error creating event:", error);
        setAlertDialog({
          isOpen: true,
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to create event. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto py-10">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex justify-center w-full mb-4">
            <Button variant="outline" className="w-auto bg-primary text-white">
              View Attendance Instructions
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-[350px] lg:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-lg lg:xl">
              Event Attendance Management Instructions
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] w-full rounded-md border p-4">
            <div className="text-sm lg:text-lg space-y-4">
              <h3 className="text-lg font-semibold">
                Attendance Recording Process:
              </h3>
              <p>
                Recorded attendance for the events you created will be saved
                under General Attendance. If you created an event specifically
                for a particular college, please follow these steps:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Transfer the recorded attendance from General Attendance to
                  Segregated Attendance.
                </li>
                <li>
                  Locate the specific college in General Attendance for which
                  you created the event.
                </li>
                <li>
                  Add the attendance to the specific college or organization.
                </li>
                <li>
                  Delete the corresponding recorded attendance in General
                  Attendance to prevent it from being included in fines
                  management.
                </li>
              </ul>
              <p>
                If you created an event specifically for any organizations under
                JRMSU-TC:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transfer it to Segregated Attendance.</li>
                <li>
                  Select the JRMSU-TC organizations from General Attendance.
                </li>
                <li>
                  Delete the corresponding recorded attendance in General
                  Attendance.
                </li>
              </ul>
              <p>
                If the event you created is for the entire student body of
                JRMSU-TC, leave it in General Attendance.
              </p>
              <p className="font-semibold mt-4">
                All recorded attendance can be printed under Print Attendance.
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>General Attendance:</strong>{" "}
                  <a
                    href="https://ssg-qr-attendance.vercel.app/admin/general-attendance"
                    className="text-blue-500 hover:underline"
                  >
                    https://ssg-qr-attendance.vercel.app/admin/general-attendance
                  </a>
                </p>
                <p>
                  <strong>Segregated Attendance:</strong>{" "}
                  <a
                    href="https://ssg-qr-attendance.vercel.app/admin/segregated-attendance"
                    className="text-blue-500 hover:underline"
                  >
                    https://ssg-qr-attendance.vercel.app/admin/segregated-attendance
                  </a>
                </p>
                <p>
                  <strong>Print Attendance:</strong>{" "}
                  <a
                    href="https://ssg-qr-attendance.vercel.app/admin/print-attendance"
                    className="text-blue-500 hover:underline"
                  >
                    https://ssg-qr-attendance.vercel.app/admin/print-attendance
                  </a>
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Card className="w-full max-w-xs lg:max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the details to create a new SSG event.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event-name" className="flex items-center">
              Event Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="event-name"
              placeholder="Enter event name"
              value={formFields.eventName.value}
              onChange={(e) => updateField("eventName", e.target.value)}
              className={cn(formFields.eventName.error && "border-destructive")}
            />
            {formFields.eventName.error && (
              <p className="text-sm text-destructive">
                {formFields.eventName.error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Date
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toDateString() : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Time
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                value={formFields.eventTime.value}
                onValueChange={(value) => updateField("eventTime", value)}
              >
                <SelectTrigger
                  className={cn(
                    formFields.eventTime.error && "border-destructive"
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {Array.from({ length: 48 }, (_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = i % 2 === 0 ? "00" : "30";
                    const time24 = `${hour
                      .toString()
                      .padStart(2, "0")}:${minute}`;
                    const time12 = formatTime(time24);

                    return (
                      <SelectItem key={time24} value={time24}>
                        {time12}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {formFields.eventTime.error && (
                <p className="text-sm text-destructive">
                  {formFields.eventTime.error}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              Location
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Event location"
                className={cn(
                  "pl-8",
                  formFields.location.error && "border-destructive"
                )}
                value={formFields.location.value}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            {formFields.location.error && (
              <p className="text-sm text-destructive">
                {formFields.location.error}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleCreateEvent}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </Button>
        </CardFooter>
        <footer className="py-4 text-center">
          <p className="text-sm">JESUS BE ALL THE GLORY!</p>
          <p className="text-xs mt-1">© SSG QR Attendance</p>
        </footer>
      </Card>

      <AlertDialog
        open={alertDialog?.isOpen}
        onOpenChange={() => setAlertDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog?.description}
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
