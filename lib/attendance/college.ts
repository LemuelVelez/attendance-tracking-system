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
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfTeacherEducation_Attendance_COLLECTION_ID ||
  "";
const COE_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfEngineering_Attendance_COLLECTION_ID || "";
const CCJE_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfCriminalJusticeEducation_Attendance_COLLECTION_ID ||
  "";
const CBA_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfBusinessAdministration_Attendance_COLLECTION_ID ||
  "";
const CAS_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfArtsAndSciences_Attendance_COLLECTION_ID ||
  "";
const CAF_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfAgricultureAndForestry_Attendance_COLLECTION_ID ||
  "";
const CCS_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_CollegeOfComputingStudies_Attendance_COLLECTION_ID ||
  "";
const JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID =
  process.env
    .NEXT_PUBLIC_APPWRITE_JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID || "";

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
    !CCS_ATTENDANCE_COLLECTION_ID ||
    !JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID
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

interface GeneralAttendance extends User, EventData {}

interface CollegeAttendance extends User, EventData {}

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
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    CTE_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export const createCOEAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    COE_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export const createCCJEAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    CCJE_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export const createCBAAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    CBA_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export const createCASAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    CAS_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export const createCAFAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    CAF_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export const createCCSAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    CCS_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

const createCollegeAttendance = async (
  collectionId: string,
  eventData: EventData,
  userData: User
): Promise<CollegeAttendance | null> => {
  try {
    validateEnvVariables();

    if (!userData) {
      throw new Error("User data is required to create attendance record.");
    }

    // Check for existing attendance record with the same userId and eventName
    const existingRecords = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [
        Query.equal("userId", userData.userId),
        Query.equal("eventName", eventData.eventName),
      ]
    );

    if (existingRecords.documents.length > 0) {
      console.log("Attendance already recorded for this user and event.");
      return null;
    }

    // Create the document with updated permissions
    const result = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      {
        userId: userData.userId,
        studentId: userData.studentId,
        name: userData.name,
        degreeProgram: userData.degreeProgram,
        yearLevel: userData.yearLevel,
        section: userData.section,
        eventName: eventData.eventName,
        location: eventData.location,
        date: eventData.date,
        day: eventData.day,
        time: eventData.time,
      },
      [
        Permission.read(Role.any()),
        Permission.write(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    console.log("Attendance record created successfully:", result);
    return {
      userId: result.userId,
      studentId: result.studentId,
      name: result.name,
      degreeProgram: result.degreeProgram,
      yearLevel: result.yearLevel,
      section: result.section,
      eventName: result.eventName,
      location: result.location,
      date: result.date,
      day: result.day,
      time: result.time,
    } as CollegeAttendance;
  } catch (error) {
    console.error("Error creating college attendance record:", error);
    throw error;
  }
};

export const createJRMSUTCOrganizationsAttendance = async (
  eventData: EventData,
  userData: User
): Promise<GeneralAttendance | null> => {
  return createCollegeAttendance(
    JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID,
    eventData,
    userData
  );
};

export { getCurrentSession, getCurrentUser, createCollegeAttendance };
