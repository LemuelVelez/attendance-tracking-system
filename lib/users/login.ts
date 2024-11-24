import { Client, Account, Databases, Query } from "appwrite"; // Import the Query module

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
 * Login function using studentId and password.
 * @param studentId - The student's ID for login.
 * @param password - The password for authentication.
 * @returns The user document if successful.
 */
export const loginStudentUser = async (studentId: string, password: string) => {
  try {
    // Step 1: Find the user document by studentId
    const userDocument = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        Query.equal("studentId", studentId), // Use Query.equal with imported Query module
      ]
    );

    // If no user is found with the provided studentId, throw an error
    if (userDocument.total === 0) {
      throw new Error("User not found");
    }

    const user = userDocument.documents[0];

    // Step 2: Authenticate the user with the email and password
    const session = await account.createEmailPasswordSession(
      user.email,
      password
    );
    console.log("User authenticated:", session);

    // Step 3: Return the authenticated user document
    return user;
  } catch (error) {
    console.error("Error in loginStudentUser:", error);
    throw error;
  }
};

// Export initialized services for reusability in other modules
export { client, account, databases };
