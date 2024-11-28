import { Client, Account, Databases, Query } from "appwrite";

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
      [Query.equal("studentId", studentId)] // Use Query.equal with imported Query module
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

/**
 * Logout function to log the user out and delete the session.
 */
export const logoutStudentUser = async () => {
  try {
    // Delete the current session
    await account.deleteSession("current");
    console.log("User logged out successfully and session deleted.");
  } catch (error) {
    console.error("Error logging out the user:", error);
    throw error;
  }
};

/**
 * Check if the current session is active.
 * @returns The current session if active, or null otherwise.
 */
export const getActiveSession = async () => {
  try {
    const session = await account.get();
    const userId = session.$id;

    // Fetch user data to determine role
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    console.log("Session:", session); // Log session
    console.log("User Document:", userDocument); // Log user document

    return { session, user: userDocument };
  } catch (error) {
    console.error("Error fetching session or user:", error);
    return null; // Return null if session is not found or there's an error
  }
};

/**
 * Retrieve the session for accessing protected routes with HOC.
 * @returns The session data if valid or null if not authenticated.
 */
export const getSessionForProtectedRoute = async () => {
  try {
    const session = await account.get();
    console.log("Valid session for protected route:", session);
    return session; // Return session if found
  } catch (error) {
    console.error("No valid session found for protected route:", error);
    return null; // Return null if session is invalid or missing
  }
};

/**
 * Retrieve the session and check if the user has admin role.
 * @returns true if the user has admin access, false otherwise.
 */
export const checkAdminRole = async () => {
  try {
    // Step 1: Get the active session
    const session = await account.get();
    const userId = session.$id;

    // Step 2: Fetch user document to get the role
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    console.log("User Document:", userDocument); // Log user document

    // Step 3: Check if the user's role is 'admin'
    if (userDocument.role && userDocument.role === "admin") {
      console.log("User is an admin.");
      return true;
    } else {
      console.log("User is not an admin.");
      return false;
    }
  } catch (error) {
    console.error("Error fetching user or checking role:", error);
    return false; // Return false if there's an error
  }
};

// Export initialized services for reusability in other modules
export { client, account, databases };
