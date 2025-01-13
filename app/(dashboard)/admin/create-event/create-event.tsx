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

        const eventData = {
          eventName: formFields.eventName.value,
          date: date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
          time: formFields.eventTime.value, // This is now in 24-hour format
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
          }" created successfully for ${eventData.date} at ${formatTime(
            eventData.time
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
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto py-10">
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
