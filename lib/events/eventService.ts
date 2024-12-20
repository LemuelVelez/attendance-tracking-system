import { Client, Databases } from "appwrite";

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
  description: string;
}) => {
  try {
    validateEnvVariables();

    const eventDocument = await databases.createDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      "unique()", // Appwrite will generate a unique ID
      {
        eventName: data.eventName,
        date: data.date,
        time: data.time,
        day: data.day,
        location: data.location,
        description: data.description,
      }
    );

    console.log("Event document created:", eventDocument);
    return eventDocument;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
};

// Export initialized services for reusability in other modules
export { client, databases };
