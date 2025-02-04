"use client";

import React, { useState, useEffect } from "react";
import { Bell, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  updateStatusNotification,
  deleteNotification,
  getNotifications,
  getCurrentUser,
  createNotifications,
  getAllEventsFromEventsCollection,
} from "@/lib/eventNotification/eventNotification";

const formatTo12Hour = (time: string): string => {
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

interface Event {
  id: string;
  userId: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
  status: "read" | "unread" | "deleted";
}

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();
  const [isMarkAllAsReadLoading, setIsMarkAllAsReadLoading] = useState(false);
  const [isDeleteAllLoading, setIsDeleteAllLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const userId = await getCurrentUser();
        if (!userId) {
          throw new Error("No authenticated user found");
        }

        // Fetch all events and create notifications if they don't exist
        const allEvents = await getAllEventsFromEventsCollection();
        if (allEvents.length > 0) {
          try {
            await createNotifications(allEvents);
          } catch (error) {
            console.error("Error creating notifications:", error);
          }
        }

        // Fetch the notifications
        const notifications = await getNotifications();
        if (notifications.length > 0) {
          setEvents(notifications);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch notifications.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, [toast]);

  const unreadCount = events.filter((event) => event.status === "unread")
    .length;

  const handleNotificationClick = () => {
    setIsOpen(true);
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      setEvents(events.filter((event) => event.id !== id));
      toast({
        title: "Notification deleted",
        description: "The notification has been successfully removed.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const updatedNotification = await updateStatusNotification(id, "read");
      setEvents(
        events.map((event) => (event.id === id ? updatedNotification : event))
      );
      toast({
        title: "Marked as read",
        description: "The notification has been marked as read.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkAllAsReadLoading(true);
    try {
      const updatedNotifications = await Promise.all(
        events
          .filter((event) => event.status === "unread")
          .map((event) => updateStatusNotification(event.id, "read"))
      );
      setEvents(
        events.map((event) => {
          const updated = updatedNotifications.find((n) => n.id === event.id);
          return updated || event;
        })
      );
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description:
          "Failed to mark all notifications as read. Please try again.",
        variant: "destructive",
      });
    }
    setIsMarkAllAsReadLoading(false);
  };

  const handleDeleteAll = async () => {
    setIsDeleteAllLoading(true);
    try {
      await Promise.all(events.map((event) => deleteNotification(event.id)));
      setEvents([]);
      setIsDeleteAllDialogOpen(false);
      toast({
        title: "Success",
        description: "All notifications have been successfully removed.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast({
        title: "Error",
        description: "Failed to delete all notifications. Please try again.",
        variant: "destructive",
      });
    }
    setIsDeleteAllLoading(false);
  };

  return (
    <div className="absolute right-4 z-50 lg:right-8">
      <Card className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
        <button
          onClick={handleNotificationClick}
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] min-w-[1.2rem] h-[1.2rem] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[425px] w-[95vw] max-h-[90vh] h-auto flex flex-col"
          aria-describedby="notification-description"
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription
              id="notification-description"
              className="sr-only"
            >
              View and manage your notifications
            </DialogDescription>
          </DialogHeader>
          <div id="notification-content">
            <div className="flex flex-col sm:flex-row justify-end mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
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
              <AlertDialog
                open={isDeleteAllDialogOpen}
                onOpenChange={setIsDeleteAllDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={events.length === 0 || isDeleteAllLoading}
                    className="w-full sm:w-auto"
                  >
                    {isDeleteAllLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your notifications.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll}>
                      {isDeleteAllLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <ScrollArea className="flex-grow pr-4 h-full -mr-4 overflow-y-auto max-h-[60vh] sm:max-h-none">
              <div className="h-full overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : events.length === 0 ? (
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
                              onDelete={() =>
                                handleDeleteNotification(event.id)
                              }
                              onMarkAsRead={() => handleMarkAsRead(event.id)}
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
                          onDelete={() => handleDeleteNotification(event.id)}
                          onMarkAsRead={() => handleMarkAsRead(event.id)}
                        />
                      ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NotificationCardProps {
  event: Event;
  onDelete: () => void;
  onMarkAsRead: () => void;
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
    await onDelete();
    setIsDeleteLoading(false);
  };

  const handleMarkAsRead = async () => {
    setIsMarkAsReadLoading(true);
    await onMarkAsRead();
    setIsMarkAsReadLoading(false);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="flex-grow mb-2 sm:mb-0">
            <h3 className="font-semibold text-lg">{event.eventName}</h3>
            <p className="text-sm text-gray-600">{event.location}</p>
            <p className="text-sm text-gray-600">
              {`${event.day}, ${new Date(event.date).toLocaleDateString(
                "en-US",
                { month: "2-digit", day: "2-digit", year: "numeric" }
              )} at ${formatTo12Hour(event.time)}`}
            </p>
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
