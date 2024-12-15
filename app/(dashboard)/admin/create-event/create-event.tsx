"use client";

import { useState } from "react";
import { CalendarIcon, Clock, MapPin, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function CreateEvent() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the details to create a new SSG event.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input id="event-name" placeholder="Enter event name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
              <Label>Time</Label>
              <Select>
                <SelectTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                    const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert to 12-hour format
                    const suffix = hour < 12 ? "AM" : "PM"; // AM/PM suffix

                    // Create options for both 00 and 30 minutes for each hour
                    return (
                      <>
                        <SelectItem
                          key={`${hour}-00`}
                          value={`${formattedHour}:00 ${suffix}`}
                        >
                          {`${formattedHour
                            .toString()
                            .padStart(2, "0")}:00 ${suffix}`}
                        </SelectItem>
                        <SelectItem
                          key={`${hour}-30`}
                          value={`${formattedHour}:30 ${suffix}`}
                        >
                          {`${formattedHour
                            .toString()
                            .padStart(2, "0")}:30 ${suffix}`}
                        </SelectItem>
                      </>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Event location"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of the event"
            />
          </div>

          <div className="space-y-2">
            <Label>QR Code Expiration</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Create Event and Generate QR Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
