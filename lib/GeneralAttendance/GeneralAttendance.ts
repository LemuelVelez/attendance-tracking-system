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

export const getGeneralAttendance = async (): Promise<Attendance[]> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const allDocuments = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    const uniqueMap = new Map<string, Attendance>();
    const duplicatesToDelete: string[] = [];

    allDocuments.documents.forEach((doc: Models.Document) => {
      const attendance = doc as Attendance;
      const key = `${attendance.userId}-${attendance.eventName}-${attendance.date}`;
      if (uniqueMap.has(key)) {
        duplicatesToDelete.push(doc.$id);
      } else {
        uniqueMap.set(key, attendance);
      }
    });

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

    const finalDocuments = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    return finalDocuments.documents as Attendance[];
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

export interface FineDocumentData {
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

export interface FineDocument extends FineDocumentData, Models.Document {}

function isFineDocument(doc: unknown): doc is FineDocument {
  if (typeof doc !== "object" || doc === null) {
    console.log("Document is not an object");
    return false;
  }

  const fineDoc = doc as Partial<FineDocument>;
  const requiredProps = [
    "$id",
    "userId",
    "studentId",
    "name",
    "absences",
    "presences",
    "penalties",
    "dateIssued",
    "status",
  ];
  const missingProps = requiredProps.filter((prop) => !(prop in fineDoc));

  if (missingProps.length > 0) {
    console.log("Missing properties:", missingProps);
    return false;
  }

  if (
    fineDoc.status !== "Pending" &&
    fineDoc.status !== "Submitted" &&
    fineDoc.status !== "Cleared"
  ) {
    console.log("Invalid status:", fineDoc.status);
    return false;
  }

  return true;
}

export const createFineDocument = async (
  fineData: FineDocumentData
): Promise<FineDocument> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const existingDocuments = await databases.listDocuments(
      DATABASE_ID,
      FINES_MANAGEMENT_COLLECTION_ID,
      [
        Query.equal("userId", fineData.userId),
        Query.equal("studentId", fineData.studentId),
        Query.equal("dateIssued", fineData.dateIssued),
      ]
    );

    if (existingDocuments.documents.length > 0) {
      console.log("Duplicate fine document found. Not creating a new one.");
      const existingDoc = existingDocuments.documents[0];
      if (isFineDocument(existingDoc)) {
        return existingDoc;
      } else {
        throw new Error(
          "Existing document does not match FineDocument structure"
        );
      }
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      FINES_MANAGEMENT_COLLECTION_ID,
      ID.unique(),
      fineData
    );

    console.log("Created document:", response);

    if (!isFineDocument(response)) {
      console.error("Document structure mismatch:", response);
      throw new Error("Created document does not match FineDocument structure");
    }

    console.log(`Successfully created fine document with ID: ${response.$id}`);
    return response;
  } catch (error) {
    console.error("Error in createFineDocument:", error);
    throw error;
  }
};

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

    const uniqueMap = new Map<string, FineDocument>();
    const duplicatesToDelete: string[] = [];

    response.documents.forEach((doc: unknown) => {
      if (isFineDocument(doc)) {
        const key = `${doc.userId}-${doc.studentId}-${doc.dateIssued}`;
        if (uniqueMap.has(key)) {
          duplicatesToDelete.push(doc.$id);
        } else {
          uniqueMap.set(key, doc);
        }
      }
    });

    await Promise.all(
      duplicatesToDelete.map((id) =>
        databases.deleteDocument(
          DATABASE_ID,
          FINES_MANAGEMENT_COLLECTION_ID,
          id
        )
      )
    );

    console.log(
      `Deleted ${duplicatesToDelete.length} duplicate fine documents.`
    );

    const fineDocuments = Array.from(uniqueMap.values());

    if (fineDocuments.length !== response.documents.length) {
      console.warn(
        `Found ${response.documents.length -
          fineDocuments.length} invalid or duplicate fine documents.`
      );
    }

    return fineDocuments;
  } catch (error) {
    console.error("Error in getFineDocuments:", error);
    throw error;
  }
};

export const getTotalUniqueEvents = async (): Promise<number> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const allDocuments = await databases.listDocuments(
      DATABASE_ID,
      GENERAL_ATTENDANCE_COLLECTION_ID
    );

    const uniqueEvents = new Set<string>();

    allDocuments.documents.forEach((doc: Models.Document) => {
      if ((doc as Attendance).eventName) {
        uniqueEvents.add((doc as Attendance).eventName);
      }
    });

    return uniqueEvents.size;
  } catch (error) {
    console.error("Error in getTotalUniqueEvents:", error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    if (!DATABASE_ID || !USERS_COLLECTION_ID) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID
    );

    return response.documents as User[];
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw error;
  }
};
