import { Client, Account, Databases, Query, ID } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Appwrite Services
const databases = new Databases(client);
const account = new Account(client);

// Define environment variables
const EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "";
const EVENTS_NOTIFICATION_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_EVENTS_NOTIFICATION_COLLECTION_ID || "";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

// Helper function for environment validation
const validateEnvVariables = () => {
  if (
    !EVENTS_COLLECTION_ID ||
    !EVENTS_NOTIFICATION_COLLECTION_ID ||
    !DATABASE_ID
  ) {
    throw new Error(
      "Missing Appwrite environment variables for event notifications. Please check your .env file."
    );
  }
};

interface EventNotification {
  id: string;
  userId: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
  status: "read" | "unread" | "deleted";
}

export const getCurrentUser = async (): Promise<string | null> => {
  try {
    const user = await account.get();
    return user.$id;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const createNotifications = async (events: Omit<EventNotification, 'id' | 'userId' | 'status'>[]): Promise<void> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Fetch existing notifications for the user
    const existingNotifications = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_NOTIFICATION_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    const existingEventNames = new Set(existingNotifications.documents.map(doc => doc.eventName));

    for (const eventData of events) {
      // Check if a notification with the same event name already exists for the user
      if (existingEventNames.has(eventData.eventName)) {
        console.log("Notification with this event name already exists for user:", userId);
        continue;
      }

      // Create new notification
      const notificationData: Omit<EventNotification, 'id'> = {
        userId,
        ...eventData,
        status: "unread",
      };

      await databases.createDocument(
        DATABASE_ID,
        EVENTS_NOTIFICATION_COLLECTION_ID,
        ID.unique(),
        notificationData
      );

      console.log("Notification created for user:", userId, "Event:", eventData.eventName);
      existingEventNames.add(eventData.eventName);
    }
  } catch (error) {
    console.error("Error in createNotifications:", error);
    throw error;
  }
};

export const getAllEventsFromEventsCollection = async (): Promise<Omit<EventNotification, 'id' | 'userId' | 'status'>[]> => {
  try {
    validateEnvVariables();
    const response = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    return response.documents.map(event => ({
      eventName: event.eventName,
      location: event.location,
      date: event.date,
      day: event.day,
      time: event.time,
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const getNotifications = async (): Promise<EventNotification[]> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      console.log("No authenticated user found");
      return [];
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_NOTIFICATION_COLLECTION_ID,
      [Query.equal("userId", userId), Query.notEqual("status", "deleted"), Query.orderDesc("$createdAt")]
    );

    const notifications: EventNotification[] = response.documents.map(doc => ({
      id: doc.$id,
      userId: doc.userId,
      eventName: doc.eventName,
      location: doc.location,
      date: doc.date,
      day: doc.day,
      time: doc.time,
      status: doc.status,
    }));

    // Group notifications by eventName
    const groupedNotifications = notifications.reduce((acc, notification) => {
      if (!acc[notification.eventName]) {
        acc[notification.eventName] = [];
      }
      acc[notification.eventName].push(notification);
      return acc;
    }, {} as Record<string, EventNotification[]>);

    // Delete duplicate notifications, keeping only the most recent one
    for (const eventName in groupedNotifications) {
      const notificationsForEvent = groupedNotifications[eventName];
      if (notificationsForEvent.length > 1) {
        // Sort by date, most recent first
        notificationsForEvent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Keep the first (most recent) notification, delete the rest
        for (let i = 1; i < notificationsForEvent.length; i++) {
          await databases.deleteDocument(
            DATABASE_ID,
            EVENTS_NOTIFICATION_COLLECTION_ID,
            notificationsForEvent[i].id
          );
        }
      }
    }

    // Return only the most recent notification for each eventName
    const uniqueNotifications = Object.values(groupedNotifications).map(group => group[0]);

    console.log("Notifications fetched and duplicates removed for user:", userId);
    return uniqueNotifications;
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    await databases.updateDocument(
      DATABASE_ID,
      EVENTS_NOTIFICATION_COLLECTION_ID,
      notificationId,
      { status: "deleted" }
    );

    console.log("Notification marked as deleted for user:", userId);
    return true;
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    throw error;
  }
};

export const updateStatusNotification = async (
  notificationId: string,
  status: "read" | "unread"
): Promise<EventNotification> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    const updatedNotification = await databases.updateDocument(
      DATABASE_ID,
      EVENTS_NOTIFICATION_COLLECTION_ID,
      notificationId,
      { status: status }
    );

    const notification: EventNotification = {
      id: updatedNotification.$id,
      userId: updatedNotification.userId,
      eventName: updatedNotification.eventName,
      location: updatedNotification.location,
      date: updatedNotification.date,
      day: updatedNotification.day,
      time: updatedNotification.time,
      status: updatedNotification.status,
    };

    console.log("Notification status updated for user:", userId);
    return notification;
  } catch (error) {
    console.error("Error in updateStatusNotification:", error);
    throw error;
  }
};

// Export initialized services for reusability in other modules
export { client, databases, account };

