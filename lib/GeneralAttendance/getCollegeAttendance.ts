/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases, Query } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

// Helper function to get attendance for a specific college
const getCollegeAttendance = async (collectionId: string): Promise<any[]> => {
  try {
    if (!DATABASE_ID || !collectionId) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    const documents = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    return documents.documents.map((doc: any) => ({
      ...doc,
      Created: doc.$createdAt,
    }));
  } catch (error) {
    console.error(`Error in getCollegeAttendance for ${collectionId}:`, error);
    throw error;
  }
};

// Functions for each college

export const getCollegeOfTeacherEducationAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfTeacherEducation_Attendance_COLLECTION_ID ||
      ""
  );
};

export const getCollegeOfEngineeringAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfEngineering_Attendance_COLLECTION_ID || ""
  );
};

export const getCollegeOfCriminalJusticeEducationAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfCriminalJusticeEducation_Attendance_COLLECTION_ID ||
      ""
  );
};

export const getCollegeOfBusinessAdministrationAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfBusinessAdministration_Attendance_COLLECTION_ID ||
      ""
  );
};

export const getCollegeOfArtsAndSciencesAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfArtsAndSciences_Attendance_COLLECTION_ID ||
      ""
  );
};

export const getCollegeOfAgricultureAndForestryAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfAgricultureAndForestry_Attendance_COLLECTION_ID ||
      ""
  );
};

export const getCollegeOfComputingStudiesAttendance = async (): Promise<any[]> => {
  return getCollegeAttendance(
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfComputingStudies_Attendance_COLLECTION_ID ||
      ""
  );
};
