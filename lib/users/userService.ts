import { Client, Databases, Query, Models } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Appwrite Services
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

// Define the Student type
export type Student = {
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: number;
  section: string;
  role: string;
  email: string;
  avatar: string;
};

/**
 * Get all users from the users collection
 */
export const getAllUsers = async (): Promise<Student[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        Query.select([
          "$id",
          "studentId",
          "name",
          "degreeProgram",
          "yearLevel",
          "section",
          "role",
          "email",
          "avatar",
        ]),
      ]
    );
    return response.documents.map((doc: Models.Document) => ({
      userId: doc.$id,
      studentId: doc.studentId,
      name: doc.name,
      degreeProgram: doc.degreeProgram,
      yearLevel: doc.yearLevel,
      section: doc.section,
      role: doc.role,
      email: doc.email,
      avatar: doc.avatar || "https://github.com/shadcn.png", // Use the existing avatar URL or fallback
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Update user role
 * @param userId - The ID of the user
 * @param newRole - The new role ('admin' or 'student')
 */
export const updateUserRole = async (
  userId: string,
  newRole: "admin" | "student"
): Promise<Models.Document> => {
  try {
    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      { role: newRole }
    );
    return updatedUser;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};
