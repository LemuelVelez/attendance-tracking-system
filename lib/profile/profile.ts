import {
  databases,
  storage,
  account,
  client,
  USERS_COLLECTION_ID,
  DATABASE_ID,
  AVATAR_BUCKET_ID,
} from "../profile/appwrite-config";
import { AppwriteException } from "appwrite";

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

    return userDocument.avatar || "https://github.com/shadcn.png";
  } catch (error) {
    console.error("Error retrieving user avatar:", error);
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

function generateUniqueId() {
  const timestamp = Date.now();
  const randomString = Math.random()
    .toString(36)
    .substring(2, 8);
  return `${timestamp}-${randomString}`;
}

export const deleteAccount = async (password: string) => {
  if (!password) {
    throw new Error("Password is required to delete the account");
  }

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
        console.warn("Error deleting avatar. It might not exist.", error);
      }
    }

    await databases.deleteDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    const uniqueId = generateUniqueId();

    await account.updateEmail(`deleted-user-${uniqueId}@example.com`, password);
    await account.updateName(`Deleted User ${uniqueId}`);

    try {
      const sessions = await account.listSessions();
      for (const sess of sessions.sessions) {
        await account.deleteSession(sess.$id);
      }
    } catch (error) {
      console.warn("Error deleting sessions.", error);
    }

    await account.updatePrefs({});
    await account.deleteSession("current");

    console.log("Account deleted successfully");
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        throw new Error(
          "Your session has expired. Please log in again before deleting your account."
        );
      } else if (
        error.message.includes("User (role: guests) missing scope (account)")
      ) {
        throw new Error(
          "You don't have the necessary permissions to delete your account. Please contact support."
        );
      }
    }
    console.error("Error deleting account:", error);
    throw error;
  }
};
