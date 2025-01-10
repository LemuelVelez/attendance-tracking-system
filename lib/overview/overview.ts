import { Client, Databases, Models, Query } from "appwrite";

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
  return fetchAllDocuments<User>(USERS_COLLECTION_ID);
}

async function getAllEvents(): Promise<Event[]> {
  return fetchAllDocuments<Event>(EVENTS_COLLECTION_ID);
}

async function getAllAttendance(): Promise<Attendance[]> {
  return fetchAllDocuments<Attendance>(GENERAL_ATTENDANCE_COLLECTION_ID);
}

async function getAllFines(): Promise<FineDocument[]> {
  return fetchAllDocuments<FineDocument>(FINES_MANAGEMENT_COLLECTION_ID);
}

async function fetchAllDocuments<T extends Models.Document>(
  collectionId: string
): Promise<T[]> {
  let allDocuments: T[] = [];
  let lastId: string | undefined;

  while (true) {
    const queries = [Query.limit(100)];
    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    try {
      const response = await databases.listDocuments<T>(
        DATABASE_ID,
        collectionId,
        queries
      );

      allDocuments = allDocuments.concat(response.documents);

      if (response.documents.length < 100) {
        break;
      }

      lastId = response.documents[response.documents.length - 1].$id;
    } catch (error) {
      console.error(`Error fetching documents from ${collectionId}:`, error);
      throw error;
    }
  }

  return allDocuments;
}
