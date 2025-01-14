import { Client, Databases, ID } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Appwrite Services
const databases = new Databases(client);

// Define environment variables
const EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

// Helper function for environment validation
const validateEnvVariables = () => {
  if (!EVENTS_COLLECTION_ID || !DATABASE_ID) {
    throw new Error(
      "Missing Appwrite environment variables for events. Please check your .env file."
    );
  }
};

validateEnvVariables();

/**
 * Create a new event in the events collection.
 * @param data - An object containing event details
 */
export const createEvent = async (data: {
  eventName: string;
  date: string;
  time: string;
  day: string;
  location: string;
}) => {
  try {
    validateEnvVariables();

    // Log the incoming date for debugging
    console.log('Incoming date:', data.date);

    // Extract date components without creating a Date object
    const [year, month, day] = data.date.split('-').map(Number);
    
    // Keep the exact date string as received
    const formattedDate = data.date;

    // For day name, create a Date object at noon to avoid any date shifting
    // Use explicit UTC components to prevent timezone conversion
    const dateForDayName = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayName = new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      timeZone: 'Asia/Manila' // Explicitly use Philippines timezone
    }).format(dateForDayName);

    // Log the final date being saved
    console.log('Date being saved:', formattedDate);
    console.log('Day name calculated:', dayName);

    const eventDocument = await databases.createDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      ID.unique(),
      {
        eventName: data.eventName,
        date: formattedDate,
        time: data.time,
        day: dayName,
        location: data.location,
      }
    );

    // Log the created document's date
    console.log("Created event date:", eventDocument.date);
    return eventDocument;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
};

export interface Event {
  $id: string;
  eventName: string;
  date: string;
  time: string;
  day: string;
  location: string;
}

/**
 * Fetch all events from the events collection.
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    validateEnvVariables();

    const response = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID
    );

    const events: Event[] = response.documents.map((doc) => ({
      $id: doc.$id,
      eventName: doc.eventName,
      date: doc.date,
      time: doc.time,
      day: doc.day,
      location: doc.location,
    }));

    return events;
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    throw error;
  }
};

export const editEvent = async (
  eventId: string,
  data: Partial<Event>
): Promise<Event> => {
  try {
    validateEnvVariables();

    const eventDocument = await databases.updateDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      eventId,
      data
    );

    const updatedEvent: Event = {
      $id: eventDocument.$id,
      eventName: eventDocument.eventName,
      date: eventDocument.date,
      time: eventDocument.time,
      day: eventDocument.day,
      location: eventDocument.location,
    };

    return updatedEvent;
  } catch (error) {
    console.error("Error in editEvent:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    validateEnvVariables();
    await databases.deleteDocument(DATABASE_ID, EVENTS_COLLECTION_ID, eventId);
    return true;
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    throw error;
  }
};

// Export initialized services for reusability in other modules
export { client, databases };

