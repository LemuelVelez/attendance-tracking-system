import { Account, Databases } from "appwrite";
import { Client } from "appwrite";

// Define environment variables
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "") // Your Appwrite Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ""); // Your Project ID

// Initialize Appwrite Account and Database Service
const account = new Account(client);
const database = new Databases(client);

// Verify if the user has an active session
export const verifySession = async () => {
  try {
    // Check if there's an existing session
    const session = await account.getSession("current");
    return session ? session : null;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
};

// Function to fetch user details from Appwrite using the session's userId (from the users collection)
export const getUserBySession = async (userId: string) => {
  try {
    // Query the Appwrite database to fetch user details by userId
    const user = await database.getDocument(
      DATABASE_ID, // The database ID, read from environment variable
      USERS_COLLECTION_ID, // The collection ID, read from environment variable
      userId // The userId from the session
    );
    return user ? user : null;
  } catch (error) {
    console.error("Failed to fetch user details from the database:", error);
    return null;
  }
};
