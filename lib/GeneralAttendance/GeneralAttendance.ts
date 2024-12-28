/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const GENERAL_ATTENDANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || "";

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
