import { Client, Databases, Query, Account } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const GENERAL_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || "";

const validateEnvVariables = () => {
  if (
    !DATABASE_ID ||
    !USERS_COLLECTION_ID ||
    !GENERAL_ATTENDANCE_COLLECTION_ID
  ) {
    throw new Error(
      "Missing Appwrite environment variables. Please check your .env file."
    );
  }
};

interface User {
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: string;
  section: string;
}

export interface EventData {
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
}

interface GeneralAttendance extends User, EventData {}

const getCurrentSession = async (): Promise<string | null> => {
  try {
    const session = await account.getSession("current");
    return session.userId;
  } catch (error) {
    console.error("Error fetching current session:", error);
    return null;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    validateEnvVariables();
    const userId = await getCurrentSession();
    if (!userId) {
      throw new Error("No active session found. Please log in and try again.");
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    if (response.documents.length > 0) {
      const user = response.documents[0];
      return {
        userId: user.userId,
        studentId: user.studentId,
        name: user.name,
        degreeProgram: user.degreeProgram,
        yearLevel: user.yearLevel,
        section: user.section,
      };
    }
    throw new Error(`User not found for userId: ${userId}`);
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const createGeneralAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance> => {
  try {
    validateEnvVariables();

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Failed to retrieve current user data.");
    }

    // Check for existing attendance record for this user and event
    const existingRecords = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [
        Query.equal("userId", user.userId),
        Query.equal("eventName", eventData.eventName),
      ]
    );

    if (existingRecords.documents.length > 0) {
      throw new Error("You have already recorded attendance for this event.");
    }

    const attendanceData: GeneralAttendance = {
      ...user,
      ...eventData,
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      "unique()",
      attendanceData
    );

    return (response as unknown) as GeneralAttendance;
  } catch (error) {
    console.error("Error creating general attendance record:", error);
    throw error;
  }
};

export { getCurrentSession, getCurrentUser };
