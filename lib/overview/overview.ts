import { Client, Databases, Models } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "";
const GENERAL_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || "";
const FINES_MANAGEMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FINES_MANAGEMENT_COLLECTION_ID || "";

export interface User extends Models.Document {
  studentId: string;
  name: string;
  email: string;
}

export interface Event extends Models.Document {
  name: string;
  date: string;
  location: string;
}

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

export async function getAllData() {
  try {
    const users = await getAllUsers();
    const events = await getAllEvents();
    const attendance = await getAllAttendance();
    const fines = await getAllFines();

    return {
      users,
      events,
      attendance,
      fines,
    };
  } catch (error) {
    console.error("Error fetching all data:", error);
    throw error;
  }
}

async function getAllUsers(): Promise<User[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID
    );
    return response.documents as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

async function getAllEvents(): Promise<Event[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID
    );
    return response.documents as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

async function getAllAttendance(): Promise<Attendance[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID
    );
    return response.documents as Attendance[];
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
}

async function getAllFines(): Promise<FineDocument[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FINES_MANAGEMENT_COLLECTION_ID
    );
    return response.documents as FineDocument[];
  } catch (error) {
    console.error("Error fetching fines:", error);
    throw error;
  }
}
