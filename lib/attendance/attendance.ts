import { Client, Databases, Query } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Appwrite Services
const databases = new Databases(client);

// Define environment variables
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "";
const GENERAL_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_generalATTENDANCE_COLLECTION_ID || "";

// Helper function for environment validation
const validateEnvVariables = () => {
  if (
    !DATABASE_ID ||
    !USERS_COLLECTION_ID ||
    !EVENTS_COLLECTION_ID ||
    !GENERAL_ATTENDANCE_COLLECTION_ID
  ) {
    throw new Error(
      "Missing Appwrite environment variables. Please check your .env file."
    );
  }
};

// Interface for User data
interface User {
  $id: string;
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: string;
  section: string;
}

// Interface for Event data
interface Event {
  $id: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
}

// Interface for GeneralAttendance data
interface GeneralAttendance {
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
  timestamp: string; // New field to store the exact time of attendance
}

/**
 * Fetch a user by their userId
 */
const getUserById = async (userId: string): Promise<User | null> => {
  try {
    validateEnvVariables();
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    return (response.documents[0] as unknown) as User | null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Fetch an event by its eventId
 */
const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    validateEnvVariables();
    const response = await databases.getDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      eventId
    );
    return (response as unknown) as Event;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

/**
 * Create a new general attendance record
 */
const createGeneralAttendance = async (data: GeneralAttendance) => {
  try {
    validateEnvVariables();
    const response = await databases.createDocument(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      "unique()",
      data
    );
    return response;
  } catch (error) {
    console.error("Error creating general attendance record:", error);
    throw error;
  }
};

/**
 * Handle QR code scan and create attendance record
 */
export const handleQRScan = async (
  userId: string,
  eventId: string
): Promise<GeneralAttendance | null> => {
  try {
    validateEnvVariables();

    // Fetch user information
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch event information
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Create general attendance record
    const attendanceData: GeneralAttendance = {
      userId: user.userId,
      studentId: user.studentId,
      name: user.name,
      degreeProgram: user.degreeProgram,
      yearLevel: user.yearLevel,
      section: user.section,
      eventName: event.eventName,
      location: event.location,
      date: event.date,
      day: event.day,
      time: event.time,
      timestamp: new Date().toISOString(), // Add current timestamp
    };

    const response = await createGeneralAttendance(attendanceData);
    console.log("Attendance record created successfully");
    return (response as unknown) as GeneralAttendance;
  } catch (error) {
    console.error("Error handling QR scan:", error);
    throw error;
  }
};

/**
 * Fetch general attendance records
 */
export const getGeneralAttendance = async (
  queries: string[] = []
): Promise<GeneralAttendance[]> => {
  try {
    validateEnvVariables();
    const response = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      queries
    );
    return (response.documents as unknown) as GeneralAttendance[];
  } catch (error) {
    console.error("Error fetching general attendance records:", error);
    throw error;
  }
};

// Export functions and initialized services for reusability in other modules
export { client, databases, validateEnvVariables };
