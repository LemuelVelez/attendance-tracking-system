import { Client, Account, Databases, Models, Query } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const GENERAL_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || "";
const FINES_MANAGEMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FINES_MANAGEMENT_COLLECTION_ID || "";
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";

export interface Attendance extends Models.Document {
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: string;
  section: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
}

export interface User extends Models.Document {
  $id: string;
  studentId: string;
  name: string;
  email: string;
}

export interface FineDocument extends Models.Document {
  userId: string;
  studentId: string;
  name: string;
  absences: string;
  presences: string;
  penalties: string;
  dateIssued: string;
  datePaid?: string;
  status: "Pending" | "Submitted" | "Cleared";
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentUser = await account.get();
    if (!currentUser) {
      return null;
    }

    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      currentUser.$id
    );

    return user as User;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const getPersonalGeneralAttendance = async (): Promise<Attendance[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("No current user found");
    }

    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [Query.equal("userId", currentUser.$id), Query.orderDesc("$createdAt")]
    );

    return response.documents as Attendance[];
  } catch (error) {
    console.error("Error in getPersonalGeneralAttendance:", error);
    throw error;
  }
};

export const getPersonalFineDocuments = async (): Promise<FineDocument[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("No current user found");
    }

    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      FINES_MANAGEMENT_COLLECTION_ID,
      [Query.equal("userId", currentUser.$id)]
    );

    return response.documents as FineDocument[];
  } catch (error) {
    console.error("Error in getPersonalFineDocuments:", error);
    throw error;
  }
};

export const getPersonalTotalUniqueEvents = async (): Promise<number> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("No current user found");
    }

    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [Query.equal("userId", currentUser.$id)]
    );

    const uniqueEvents = new Set<string>();

    response.documents.forEach((doc: Models.Document) => {
      if ((doc as Attendance).eventName) {
        uniqueEvents.add((doc as Attendance).eventName);
      }
    });

    return uniqueEvents.size;
  } catch (error) {
    console.error("Error in getPersonalTotalUniqueEvents:", error);
    throw error;
  }
};

export const getUserAvatar = async (userId: string): Promise<string | null> => {
  try {
    if (!DATABASE_ID || !USERS_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    return (user as User).avatar || null;
  } catch (error) {
    console.error("Error fetching user avatar:", error);
    return null;
  }
};
