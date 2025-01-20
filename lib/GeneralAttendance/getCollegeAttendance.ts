/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases, Query } from "appwrite";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

const COLLEGE_ATTENDANCE_COLLECTION_IDS = {
  TeacherEducation:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfTeacherEducation_Attendance_COLLECTION_ID ||
    "",
  Engineering:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfEngineering_Attendance_COLLECTION_ID || "",
  CriminalJusticeEducation:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfCriminalJusticeEducation_Attendance_COLLECTION_ID ||
    "",
  BusinessAdministration:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfBusinessAdministration_Attendance_COLLECTION_ID ||
    "",
  ArtsAndSciences:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfArtsAndSciences_Attendance_COLLECTION_ID ||
    "",
  AgricultureAndForestry:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfAgricultureAndForestry_Attendance_COLLECTION_ID ||
    "",
  ComputingStudies:
    process.env
      .NEXT_PUBLIC_APPWRITE_CollegeOfComputingStudies_Attendance_COLLECTION_ID ||
    "",
  JRMSUTCOrganizations:
    process.env
      .NEXT_PUBLIC_APPWRITE_JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID ||
    "",
};

const getCollegeAttendance = async (collectionId: string): Promise<any[]> => {
  try {
    if (!DATABASE_ID || !collectionId) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    let allDocuments: any[] = [];
    let offset = 0;
    const limit = 100; // Appwrite's maximum limit per request

    while (true) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );

      allDocuments = [...allDocuments, ...response.documents];

      if (response.documents.length < limit) {
        // We've fetched all documents
        break;
      }

      offset += limit;
    }

    const uniqueMap = new Map();
    const duplicatesToDelete: string[] = [];

    allDocuments.forEach((doc: any) => {
      const key = `${doc.userId}-${doc.eventName}-${doc.date}`;
      if (uniqueMap.has(key)) {
        duplicatesToDelete.push(doc.$id);
      } else {
        uniqueMap.set(key, doc);
      }
    });

    await Promise.all(
      duplicatesToDelete.map((id) =>
        databases.deleteDocument(DATABASE_ID, collectionId, id)
      )
    );

    console.log(`Deleted ${duplicatesToDelete.length} duplicate records.`);

    // Convert the uniqueMap values back to an array and sort by createdAt
    const finalDocuments = Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    return finalDocuments.map((doc: any) => ({
      ...doc,
      Created: doc.$createdAt,
    }));
  } catch (error) {
    console.error("Error in getCollegeAttendance:", error);
    throw error;
  }
};

export const getTeacherEducationAttendance = () =>
  getCollegeAttendance(COLLEGE_ATTENDANCE_COLLECTION_IDS.TeacherEducation);
export const getEngineeringAttendance = () =>
  getCollegeAttendance(COLLEGE_ATTENDANCE_COLLECTION_IDS.Engineering);
export const getCriminalJusticeEducationAttendance = () =>
  getCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.CriminalJusticeEducation
  );
export const getBusinessAdministrationAttendance = () =>
  getCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.BusinessAdministration
  );
export const getArtsAndSciencesAttendance = () =>
  getCollegeAttendance(COLLEGE_ATTENDANCE_COLLECTION_IDS.ArtsAndSciences);
export const getAgricultureAndForestryAttendance = () =>
  getCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.AgricultureAndForestry
  );
export const getComputingStudiesAttendance = () =>
  getCollegeAttendance(COLLEGE_ATTENDANCE_COLLECTION_IDS.ComputingStudies);

export const getJRMSUTCOrganizationsAttendance = () =>
  getCollegeAttendance(COLLEGE_ATTENDANCE_COLLECTION_IDS.JRMSUTCOrganizations);

const deleteCollegeAttendance = async (
  collectionId: string,
  documentId: string
): Promise<void> => {
  try {
    if (!DATABASE_ID || !collectionId) {
      throw new Error(
        "Missing Appwrite environment variables. Please check your .env file."
      );
    }

    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    console.log(`Successfully deleted document with ID: ${documentId}`);
  } catch (error) {
    console.error("Error in deleteCollegeAttendance:", error);
    throw error;
  }
};

export const deleteTeacherEducationAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.TeacherEducation,
    documentId
  );
export const deleteEngineeringAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.Engineering,
    documentId
  );
export const deleteCriminalJusticeEducationAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.CriminalJusticeEducation,
    documentId
  );
export const deleteBusinessAdministrationAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.BusinessAdministration,
    documentId
  );
export const deleteArtsAndSciencesAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.ArtsAndSciences,
    documentId
  );
export const deleteAgricultureAndForestryAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.AgricultureAndForestry,
    documentId
  );
export const deleteComputingStudiesAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.ComputingStudies,
    documentId
  );

export const deleteJRMSUTCOrganizationsAttendance = (documentId: string) =>
  deleteCollegeAttendance(
    COLLEGE_ATTENDANCE_COLLECTION_IDS.JRMSUTCOrganizations,
    documentId
  );

export type AttendanceType = "general" | "college";

export type CollegeType =
  | "ComputingStudies"
  | "AgricultureAndForestry"
  | "ArtsAndSciences"
  | "BusinessAdministration"
  | "CriminalJusticeEducation"
  | "Engineering"
  | "TeacherEducation"
  | "JRMSUTCOrganizations";

export interface AttendanceRecord {
  name: string;
  studentId: string;
  eventName: string;
  date: string;
  location: string;
  time: string;
}
