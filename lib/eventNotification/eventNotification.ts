import { Client, Account, Databases, Query, AppwriteException } from "appwrite";

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
  userId: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
  status: "read" | "unread";
}

export const getCurrentUser = async (): Promise<string | null> => {
  try {
    const session = await account.getSession("current");
    return session.userId;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const createNotification = async (): Promise<void> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Check if a notification already exists for the user
    try {
      await databases.getDocument(
        DATABASE_ID,
        EVENTS_NOTIFICATION_COLLECTION_ID,
        userId
      );
      console.log("Notification already exists for user:", userId);
      return; // Exit if notification already exists
    } catch (error) {
      // If the document doesn't exist, continue with creation
      if (error instanceof AppwriteException && error.code === 404) {
        // Fetch the latest event from EVENTS_COLLECTION_ID
        const eventResponse = await databases.listDocuments(
          DATABASE_ID,
          EVENTS_COLLECTION_ID,
          [Query.orderDesc("$createdAt"), Query.limit(1)]
        );

        if (eventResponse.documents.length === 0) {
          console.log("No events found to create notification.");
          return;
        }

        const latestEvent = eventResponse.documents[0];

        // Create notification in EVENTS_NOTIFICATION_COLLECTION_ID
        const notificationData: EventNotification = {
          userId: userId,
          eventName: latestEvent.eventName,
          location: latestEvent.location,
          date: latestEvent.date,
          day: latestEvent.day,
          time: latestEvent.time,
          status: "unread",
        };

        await databases.createDocument(
          DATABASE_ID,
          EVENTS_NOTIFICATION_COLLECTION_ID,
          userId, // Using userId as the document ID
          notificationData
        );

        console.log("Notification created for user:", userId);
      } else {
        throw error; // Re-throw if it's a different error
      }
    }
  } catch (error) {
    console.error("Error in createNotification:", error);
    throw error;
  }
};

export const getNotification = async (): Promise<EventNotification | null> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    const response = await databases.getDocument(
      DATABASE_ID,
      EVENTS_NOTIFICATION_COLLECTION_ID,
      userId
    );

    if (!response || response.eventName === "") {
      console.log("No active notification found for user:", userId);
      return null;
    }

    const notification: EventNotification = {
      userId: response.userId,
      eventName: response.eventName,
      location: response.location,
      date: response.date,
      day: response.day,
      time: response.time,
      status: response.status,
    };

    console.log("Notification fetched for user:", userId);
    return notification;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      console.log("No notification found for user");
      return null;
    }
    console.error("Error in getNotification:", error);
    throw error;
  }
};

export const deleteNotification = async (): Promise<boolean> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Update the document with empty strings instead of null
    const updateObject: Partial<EventNotification> = {
      eventName: "",
      location: "",
      date: "",
      day: "",
      time: "",
      status: "read", // Set to "read" as a default state after deletion
    };

    await databases.updateDocument(
      DATABASE_ID,
      EVENTS_NOTIFICATION_COLLECTION_ID,
      userId,
      updateObject
    );

    console.log("Notification content deleted for user:", userId);
    return true;
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    throw error;
  }
};

export const updateStatusNotification = async (
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
      userId,
      { status: status }
    );

    const notification: EventNotification = {
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
