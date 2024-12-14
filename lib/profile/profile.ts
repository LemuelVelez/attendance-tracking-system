import { Client, Account, Databases, Storage } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "") // Your Appwrite Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ""); // Your Project ID

// Initialize Appwrite Services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Define environment variables
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const AVATAR_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_AVATAR_BUCKET_ID || "";

// Helper function for environment validation
const validateEnvVariables = () => {
  if (!USERS_COLLECTION_ID || !DATABASE_ID || !AVATAR_BUCKET_ID) {
    throw new Error(
      "Missing Appwrite environment variables. Please check your .env file."
    );
  }
};
validateEnvVariables();

/**
 * Retrieve the specific user data from the users collection of the current active session.
 */
export const getCurrentSessionUser = async () => {
  try {
    // Step 1: Get the current active session user
    const session = await account.get();

    // Step 2: Retrieve the user data from the users collection
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    console.log("Retrieved user document:", userDocument);
    return userDocument;
  } catch (error) {
    console.error("Error retrieving current session user data:", error);
    throw error;
  }
};

/**
 * Change the password for the currently logged-in user.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The new password the user wants to set.
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    // Attempt to update the password
    await account.updatePassword(newPassword, currentPassword);
    console.log("Password updated successfully.");
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

/**
 * Add or update the avatar of the current active session user in the users collection.
 * @param {File} avatarFile - The new avatar file to upload.
 */
export const setUserAvatar = async (avatarFile: File) => {
  try {
    // Step 1: Get the current active session user
    const session = await account.get();

    // Step 2: Fetch the user's existing document
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    // Step 3: Delete the old avatar file from the bucket if it exists
    if (userDocument.avatar) {
      // Extract file ID from the old avatar URL
      const oldFileId = userDocument.avatar.split("/").slice(-2, -1)[0];
      try {
        await storage.deleteFile(AVATAR_BUCKET_ID, oldFileId);
        console.log("Old avatar deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old avatar. It might not exist.", error);
      }
    }

    // Step 4: Upload the new avatar to Appwrite storage bucket
    const uploadedFile = await storage.createFile(
      AVATAR_BUCKET_ID,
      avatarFile.name,
      avatarFile
    );

    // Step 5: Construct the correct avatar URL with required query parameters
    const avatarUrl = `${client.config.endpoint}/storage/buckets/${AVATAR_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${client.config.project}`;

    // Step 6: Update the user's document with the new avatar URL
    const updatedDocument = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id,
      { avatar: avatarUrl } // Update avatar attribute with the new file URL
    );

    console.log("User avatar updated successfully.", updatedDocument);

    return avatarUrl; // Return the new avatar URL
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
};

/**
 * Retrieve the avatar URL of the current active session user.
 */
export const getUserAvatar = async () => {
  try {
    // Step 1: Get the current active session user
    const session = await account.get();

    // Step 2: Retrieve the user document from the users collection
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    // Step 3: Return the avatar URL
    if (userDocument.avatar) {
      const avatarUrl = userDocument.avatar;
      console.log("Retrieved user avatar URL:", avatarUrl);
      return avatarUrl;
    } else {
      throw new Error("No avatar found for the current user.");
    }
  } catch (error) {
    console.error("Error retrieving user avatar:", error);
    throw error;
  }
};

/**
 * Edit user data for the current active session user in the users collection.
 * @param {Partial<UserData>} updatedData - An object containing the fields and values to update.
 */
export const editUserData = async (updatedData: Partial<UserData>) => {
  try {
    // Step 1: Get the current active session user
    const session = await account.get();

    // Step 2: Update the user's document with the new data
    const updatedDocument = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id,
      updatedData
    );

    console.log("User data updated successfully:", updatedDocument);
    return updatedDocument;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

interface UserData {
  name?: string;
  email?: string;
  studentId?: string;
  degreeProgram?: string;
  yearLevel?: string;
  section?: string;
}

// Export initialized services for reusability in other modules
export { client, account, databases, storage };
