"use client";

import React, { useState } from "react";
import { Bell, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
  status: "read" | "unread";
}

const mockEvents: Event[] = [
  {
    id: "1",
    eventName: "Team Meeting",
    location: "Conference Room A",
    date: "2023-06-15",
    day: "Thursday",
    time: "10:00 AM",
    status: "unread",
  },
  {
    id: "2",
    eventName: "Project Deadline",
    location: "Office",
    date: "2023-06-20",
    day: "Tuesday",
    time: "5:00 PM",
    status: "unread",
  },
  {
    id: "3",
    eventName: "Lunch and Learn",
    location: "Cafeteria",
    date: "2023-06-18",
    day: "Sunday",
    time: "12:30 PM",
    status: "read",
  },
];

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const { toast } = useToast();
  const [isMarkAllAsReadLoading, setIsMarkAllAsReadLoading] = useState(false);
  const [isDeleteAllLoading, setIsDeleteAllLoading] = useState(false);

  const unreadCount = events.filter((event) => event.status === "unread")
    .length;

  const handleNotificationClick = () => {
    setIsOpen(true);
  };

  const handleDeleteNotification = async (id: string) => {
    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEvents(events.filter((event) => event.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been successfully removed.",
      variant: "default",
    });
  };

  const handleMarkAsRead = async (id: string) => {
    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, status: "read" } : event
      )
    );
    toast({
      title: "Marked as read",
      description: "The notification has been marked as read.",
      variant: "default",
    });
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkAllAsReadLoading(true);
    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEvents(events.map((event) => ({ ...event, status: "read" })));
    setIsMarkAllAsReadLoading(false);
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
      variant: "default",
    });
  };

  const handleDeleteAll = async () => {
    setIsDeleteAllLoading(true);
    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEvents([]);
    setIsDeleteAllLoading(false);
    toast({
      title: "All notifications deleted",
      description: "All notifications have been successfully removed.",
      variant: "default",
    });
  };

  return (
    <div className="absolute right-10 z-50 lg:right-16">
      <Card className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
        <button
          onClick={handleNotificationClick}
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 px-2 py-1 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end mb-4 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkAllAsReadLoading}
              className="w-full sm:w-auto"
            >
              {isMarkAllAsReadLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Mark all as read
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={events.length === 0 || isDeleteAllLoading}
              className="w-full sm:w-auto"
            >
              {isDeleteAllLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete All
            </Button>
          </div>
          <ScrollArea className="flex-grow pr-4 h-full -mr-4 overflow-y-auto">
            <div className="h-full overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No notifications
                </p>
              ) : (
                <>
                  {unreadCount > 0 && (
                    <>
                      <h3 className="font-semibold mb-2">Unread</h3>
                      {events
                        .filter((event) => event.status === "unread")
                        .map((event) => (
                          <NotificationCard
                            key={event.id}
                            event={event}
                            onDelete={handleDeleteNotification}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))}
                      <Separator className="my-4" />
                    </>
                  )}
                  <h3 className="font-semibold mb-2">Read</h3>
                  {events
                    .filter((event) => event.status === "read")
                    .map((event) => (
                      <NotificationCard
                        key={event.id}
                        event={event}
                        onDelete={handleDeleteNotification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NotificationCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

function NotificationCard({
  event,
  onDelete,
  onMarkAsRead,
}: NotificationCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isMarkAsReadLoading, setIsMarkAsReadLoading] = useState(false);

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsDeleteLoading(true);
    await onDelete(event.id);
    setIsDeleteLoading(false);
  };

  const handleMarkAsRead = async () => {
    setIsMarkAsReadLoading(true);
    await onMarkAsRead(event.id);
    setIsMarkAsReadLoading(false);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="flex-grow mb-2 sm:mb-0">
            <h3 className="font-semibold text-lg">{event.eventName}</h3>
            <p className="text-sm text-gray-600">{event.location}</p>
            <p className="text-sm text-gray-600">{`${event.day}, ${event.date} at ${event.time}`}</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            {event.status === "unread" && (
              <Badge variant="secondary">New</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Delete notification"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {event.status === "unread" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full sm:w-auto"
            onClick={handleMarkAsRead}
            disabled={isMarkAsReadLoading}
          >
            {isMarkAsReadLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Mark as read
          </Button>
        )}
      </CardContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
