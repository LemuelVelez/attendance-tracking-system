import { Client, Account, Databases } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "") // Your Appwrite Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ""); // Your Project ID

// Initialize Appwrite Services
const account = new Account(client);
const databases = new Databases(client);

// Define environment variables
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

// Helper function for environment validation
const validateEnvVariables = () => {
  if (!USERS_COLLECTION_ID || !DATABASE_ID) {
    throw new Error(
      "Missing Appwrite environment variables. Please check your .env file."
    );
  }
};
validateEnvVariables();

/**
 * Retrieve the firstname of the currently logged-in user.
 * @returns {Promise<string>} - The firstname of the current user.
 */
export const getCurrentUserFirstname = async (): Promise<string> => {
  try {
    // Fetch the authenticated user
    const user = await account.get();
    console.log("Authenticated user details:", user);

    // Fetch the user document from the database
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id
    );
    console.log("User document:", userDocument);

    // Return the firstname field
    if (!userDocument.firstname) {
      throw new Error("Firstname field is missing in the user document.");
    }

    return userDocument.firstname;
  } catch (error) {
    console.error("Error in getCurrentUserFirstname:", error);
    throw error;
  }
};
