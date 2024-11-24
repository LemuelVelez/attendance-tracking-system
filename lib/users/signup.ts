// lib/users/createStudent.ts
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
 * Create a new user, authenticate the user, and link them to the users collection.
 * @param data - An object containing user details and optional attributes
 */
export const createStudentUser = async (data: {
  studentId: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  degreeProgram: string;
  yearLevel: string;
  section?: string;
  email: string;
  password: string;
}) => {
  try {
    // Step 1: Create a new user in Appwrite's authentication system
    const newUser = await account.create(
      "unique()", // Appwrite will generate the user ID
      data.email,
      data.password
    );

    console.log("New user created:", newUser);

    // Step 2: Authenticate the newly created user to retrieve their session
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );
    console.log("User authenticated:", session);

    // Step 3: Fetch the authenticated user details
    const user = await account.get();
    console.log("Fetched user details:", user);

    // Step 4: Ensure the user fields are passed correctly, including degreeProgram and yearLevel
    const userDocument = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id, // Use Appwrite's user ID here directly as the document ID
      {
        userId: user.$id, // Use the user ID from authentication
        studentId: data.studentId,
        firstname: data.firstname,
        middlename: data.middlename || null,
        lastname: data.lastname,
        degreeProgram: data.degreeProgram, // Ensure this field is included
        yearLevel: data.yearLevel, // Ensure this field is included
        section: data.section || null,
        email: user.email, // Use fetched email from authenticated user
        name:
          user.name ||
          `${data.firstname} ${data.middlename || ""} ${data.lastname}`, // Constructed name or fetched from Appwrite
        role: "student", // Default role
      }
    );

    console.log("User document created in collection:", userDocument);

    // Step 5: Terminate the session to avoid conflicts when logging in later
    await account.deleteSession("current");
    console.log("Session terminated to avoid conflicts.");

    return userDocument; // Returns the created user document
  } catch (error) {
    console.error("Error in createStudentUser:", error);
    throw error;
  }
};

// Export initialized services for reusability in other modules
export { client, account, databases };
