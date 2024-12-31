import {
  Client,
  Databases,
  Query,
  Account,
  ID,
  Permission,
  Role,
} from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const CTE_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CTE_ATTENDANCE_COLLECTION_ID || "";
const COE_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COE_ATTENDANCE_COLLECTION_ID || "";
const CCJE_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CCJE_ATTENDANCE_COLLECTION_ID || "";
const CBA_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CBA_ATTENDANCE_COLLECTION_ID || "";
const CAS_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CAS_ATTENDANCE_COLLECTION_ID || "";
const CAF_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CAF_ATTENDANCE_COLLECTION_ID || "";
const CCS_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CCS_ATTENDANCE_COLLECTION_ID || "";

const validateEnvVariables = () => {
  if (
    !DATABASE_ID ||
    !USERS_COLLECTION_ID ||
    !CTE_ATTENDANCE_COLLECTION_ID ||
    !COE_ATTENDANCE_COLLECTION_ID ||
    !CCJE_ATTENDANCE_COLLECTION_ID ||
    !CBA_ATTENDANCE_COLLECTION_ID ||
    !CAS_ATTENDANCE_COLLECTION_ID ||
    !CAF_ATTENDANCE_COLLECTION_ID ||
    !CCS_ATTENDANCE_COLLECTION_ID
  ) {
    throw new Error(
      "Missing Appwrite environment variables. Please check your .env file."
    );
  }
};

export interface User {
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

interface GeneralAttendance extends User, EventData {
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

export const createCTEAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(CTE_ATTENDANCE_COLLECTION_ID, eventData);
};

export const createCOEAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(COE_ATTENDANCE_COLLECTION_ID, eventData);
};

export const createCCJEAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(CCJE_ATTENDANCE_COLLECTION_ID, eventData);
};

export const createCBAAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(CBA_ATTENDANCE_COLLECTION_ID, eventData);
};

export const createCASAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(CAS_ATTENDANCE_COLLECTION_ID, eventData);
};

export const createCAFAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(CAF_ATTENDANCE_COLLECTION_ID, eventData);
};

export const createCCSAttendance = async (
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(CCS_ATTENDANCE_COLLECTION_ID, eventData);
};

const createCollegeAttendance = async (
  collectionId: string,
  eventData: EventData
): Promise<GeneralAttendance | null> => {
  try {
    validateEnvVariables();

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Failed to retrieve current user data.");
    }

    // Check for existing attendance record
    const existingRecords = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [
        Query.equal("userId", user.userId),
        Query.equal("eventName", eventData.eventName),
        Query.equal("date", eventData.date),
      ]
    );

    if (existingRecords.documents.length > 0) {
      console.log("Attendance already recorded for this event.");
      return null;
    }

    // Create the document with permissions
    const result = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      {
        ...user,
        ...eventData,
      },
      [
        Permission.read(Role.any()),
        Permission.write(Role.user(user.userId)),
        Permission.delete(Role.user(user.userId)),
      ]
    );

    console.log("Attendance record created successfully:", result);
    return (result as unknown) as GeneralAttendance;
  } catch (error) {
    console.error("Error creating college attendance record:", error);
    throw error;
  }
};

export { getCurrentSession, getCurrentUser, createCollegeAttendance };
