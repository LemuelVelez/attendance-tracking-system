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
 * Get the avatar of the current active session user from the users collection.
 */
export const getUserAvatar = async () => {
  try {
    // Step 1: Get the current active session user
    const session = await account.get();

    // Step 2: Retrieve the avatar URL from the user's document
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    console.log("Retrieved user avatar:", userDocument.avatar);
    return userDocument.avatar;
  } catch (error) {
    console.error("Error retrieving user avatar:", error);
    throw error;
  }
};

/**
 * Add or update the avatar of the current active session user in the users collection.
 * @param {File} avatarFile - The new avatar file to upload.
 */
export const setUserAvatar = async (avatarFile: File) => {
  try {
    // Step 1: Upload the new avatar to Appwrite storage
    const file = await storage.createFile(
      USERS_COLLECTION_ID,
      avatarFile.name,
      avatarFile
    );

    // Step 2: Update the user's document with the new avatar URL
    const session = await account.get();
    const avatarUrl = `${client.config.endpoint}/v1/storage/files/${file.$id}/view`;

    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id,
      {
        avatar: avatarUrl,
      }
    );

    console.log("User avatar updated successfully.", avatarUrl);
    return avatarUrl;
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
};

// Export initialized services for reusability in other modules
export { client, account, databases, storage };
