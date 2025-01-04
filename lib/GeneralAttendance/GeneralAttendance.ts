/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases, ID, Models } from "appwrite";
import { Query } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const GENERAL_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || "";
const FINES_MANAGEMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FINES_MANAGEMENT_COLLECTION_ID || "";

export const getGeneralAttendance = async (): Promise<any[]> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    // Step 1: Retrieve all documents
    const allDocuments = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [
        // Add the Created field to the query
        Query.orderDesc("$createdAt"),
      ]
    );

    // Step 2: Identify and delete duplicates
    const uniqueMap = new Map();
    const duplicatesToDelete: string[] = [];

    allDocuments.documents.forEach((doc: any) => {
      const key = `${doc.userId}-${doc.eventName}-${doc.date}`;
      if (uniqueMap.has(key)) {
        duplicatesToDelete.push(doc.$id);
      } else {
        uniqueMap.set(key, doc);
      }
    });

    // Delete duplicates
    await Promise.all(
      duplicatesToDelete.map((id) =>
        databases.deleteDocument(
          DATABASE_ID,
          GENERAL_ATTENDANCE_COLLECTION_ID,
          id
        )
      )
    );

    console.log(`Deleted ${duplicatesToDelete.length} duplicate records.`);

    // Step 3: Retrieve all documents again (now without duplicates)
    const finalDocuments = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [
        // Add the Created field to the query
        Query.orderDesc("$createdAt"),
      ]
    );

    // Step 4: Map the documents to include the Created field
    const documentsWithCreated = finalDocuments.documents.map((doc: any) => ({
      ...doc,
      Created: doc.$createdAt,
    }));

    return documentsWithCreated;
  } catch (error) {
    console.error("Error in getGeneralAttendance:", error);
    throw error;
  }
};

export const deleteGeneralAttendance = async (
  documentId: string
): Promise<void> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    await databases.deleteDocument(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      documentId
    );

    console.log(`Successfully deleted document with ID: ${documentId}`);
  } catch (error) {
    console.error("Error in deleteGeneralAttendance:", error);
    throw error;
  }
};

// New type definition for Fine document
export interface FineDocument extends Models.Document {
  userId: string;
  studentId: string;
  name: string;
  absences: number;
  penalties: string;
  dateIssued: string;
  datePaid?: string;
  status: "Pending" | "Submitted";
}

export const createFineDocument = async (
  fineData: Omit<FineDocument, keyof Models.Document>
): Promise<FineDocument> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      FINES_MANAGEMENT_COLLECTION_ID,
      ID.unique(),
      fineData
    );

    console.log(`Successfully created fine document with ID: ${response.$id}`);
    return response as FineDocument;
  } catch (error) {
    console.error("Error in createFineDocument:", error);
    throw error;
  }
};

// Type guard function to check if a document is a valid FineDocument
function isFineDocument(doc: any): doc is FineDocument {
  return (
    typeof doc.userId === "string" &&
    typeof doc.studentId === "string" &&
    typeof doc.name === "string" &&
    typeof doc.absences === "number" &&
    typeof doc.penalties === "string" &&
    typeof doc.dateIssued === "string" &&
    (doc.datePaid === undefined || typeof doc.datePaid === "string") &&
    (doc.status === "Pending" || doc.status === "Submitted")
  );
}

export const getFineDocuments = async (
  queries: string[] = []
): Promise<FineDocument[]> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      FINES_MANAGEMENT_COLLECTION_ID,
      queries
    );

    const fineDocuments = response.documents.filter(isFineDocument);

    if (fineDocuments.length !== response.documents.length) {
      console.warn(
        `Found ${response.documents.length -
          fineDocuments.length} invalid fine documents.`
      );
    }

    return fineDocuments;
  } catch (error) {
    console.error("Error in getFineDocuments:", error);
    throw error;
  }
};
