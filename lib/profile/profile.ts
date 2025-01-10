import {
  databases,
  storage,
  account,
  client,
  USERS_COLLECTION_ID,
  DATABASE_ID,
  AVATAR_BUCKET_ID,
} from "../profile/appwrite-config";

export interface UserData {
  name?: string;
  email?: string;
  studentId?: string;
  degreeProgram?: string;
  yearLevel?: string;
  section?: string;
  avatar?: string;
}

export const getCurrentSessionUser = async () => {
  try {
    const session = await account.get();
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );
    return userDocument;
  } catch (error) {
    console.error("Error retrieving current session user data:", error);
    throw error;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    await account.updatePassword(newPassword, currentPassword);
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

export const setUserAvatar = async (avatarFile: File) => {
  try {
    const session = await account.get();
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    if (userDocument.avatar) {
      const oldFileId = userDocument.avatar.split("/").slice(-2, -1)[0];
      try {
        await storage.deleteFile(AVATAR_BUCKET_ID, oldFileId);
      } catch (error) {
        console.warn("Error deleting old avatar. It might not exist.", error);
      }
    }

    const uploadedFile = await storage.createFile(
      AVATAR_BUCKET_ID,
      avatarFile.name,
      avatarFile
    );

    const avatarUrl = `${client.config.endpoint}/storage/buckets/${AVATAR_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${client.config.project}`;

    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id,
      { avatar: avatarUrl }
    );

    return avatarUrl;
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
};

export const getUserAvatar = async () => {
  try {
    const session = await account.get();
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    // Return the user's avatar if it exists, otherwise return the default avatar
    return userDocument.avatar || "https://github.com/shadcn.png";
  } catch (error) {
    console.error("Error retrieving user avatar:", error);
    // Return default avatar instead of throwing error
    return "https://github.com/shadcn.png";
  }
};

export const editUserData = async (updatedData: Partial<UserData>) => {
  try {
    const session = await account.get();
    const updatedDocument = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id,
      updatedData
    );
    return updatedDocument;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const session = await account.get();
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    // Delete user's avatar if it exists
    if (userDocument.avatar) {
      const oldFileId = userDocument.avatar.split("/").slice(-2, -1)[0];
      try {
        await storage.deleteFile(AVATAR_BUCKET_ID, oldFileId);
      } catch (error) {
        console.warn("Error deleting avatar. It might not exist.", error);
      }
    }

    // Delete user's document from the users collection
    await databases.deleteDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    // Delete all sessions for the current user
    await account.deleteSessions();

    // Delete the user's account from Appwrite
    await account.deleteIdentity("current");

    console.log("Account deleted successfully");
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
