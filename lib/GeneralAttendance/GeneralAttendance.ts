import { Client, Databases, ID, type Models, Query } from "appwrite"

const client = new Client()
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

const databases = new Databases(client)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
const GENERAL_ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || ""
const FINES_MANAGEMENT_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINES_MANAGEMENT_COLLECTION_ID || ""
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || ""

export interface Attendance extends Models.Document {
  userId: string
  studentId: string
  name: string
  degreeProgram: string
  yearLevel: string
  section: string
  eventName: string
  location: string
  date: string
  day: string
  time: string
}

export interface User extends Models.Document {
  $id: string
  studentId: string
  name: string
  email: string
}

export interface FineDocumentData {
  userId: string
  studentId: string
  name: string
  absences: string
  presences: string
  penalties: string
  dateIssued: string
  status: "Pending" | "Cleared" | "penaltyCleared"
}

export interface FineDocument extends FineDocumentData, Models.Document {}

function isFineDocument(doc: unknown): doc is FineDocument {
  if (typeof doc !== "object" || doc === null) {
    console.log("Document is not an object")
    return false
  }

  const fineDoc = doc as Partial<FineDocument>
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
  ]
  const missingProps = requiredProps.filter((prop) => !(prop in fineDoc))

  if (missingProps.length > 0) {
    console.log("Missing properties:", missingProps)
    return false
  }

  if (fineDoc.status !== "Pending" && fineDoc.status !== "Cleared" && fineDoc.status !== "penaltyCleared") {
    console.log("Invalid status:", fineDoc.status)
    return false
  }

  return true
}

export const getGeneralAttendance = async (): Promise<Attendance[]> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const allDocuments: Attendance[] = []
    let lastId: string | undefined

    while (true) {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(100)]
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, queries)

      const uniqueMap = new Map<string, Attendance>()
      const duplicatesToDelete: string[] = []

      response.documents.forEach((doc: Models.Document) => {
        const attendance = doc as Attendance
        const key = `${attendance.userId}-${attendance.eventName}-${attendance.date}`
        if (uniqueMap.has(key)) {
          duplicatesToDelete.push(doc.$id)
        } else {
          uniqueMap.set(key, attendance)
        }
      })

      await Promise.all(
        duplicatesToDelete.map((id) => databases.deleteDocument(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, id)),
      )

      console.log(`Deleted ${duplicatesToDelete.length} duplicate records.`)

      allDocuments.push(...Array.from(uniqueMap.values()))

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return allDocuments
  } catch (error) {
    console.error("Error in getGeneralAttendance:", error)
    throw error
  }
}

export const deleteGeneralAttendance = async (documentId: string): Promise<void> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    await databases.deleteDocument(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, documentId)

    console.log(`Successfully deleted document with ID: ${documentId}`)
  } catch (error) {
    console.error("Error in deleteGeneralAttendance:", error)
    throw error
  }
}

export const createFineDocument = async (fineData: FineDocumentData): Promise<FineDocument> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const existingDocuments = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [
      Query.equal("userId", fineData.userId),
      Query.equal("studentId", fineData.studentId),
      Query.equal("dateIssued", fineData.dateIssued),
    ])

    if (existingDocuments.documents.length > 0) {
      const existingDoc = existingDocuments.documents[0]
      if (isFineDocument(existingDoc)) {
        // Update the existing document
        const updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          FINES_MANAGEMENT_COLLECTION_ID,
          existingDoc.$id,
          fineData,
        )
        console.log("Updated existing fine document:", updatedDoc)
        if (isFineDocument(updatedDoc)) {
          return updatedDoc
        } else {
          throw new Error("Updated document does not match FineDocument structure")
        }
      } else {
        throw new Error("Existing document does not match FineDocument structure")
      }
    } else {
      // Create a new document
      const response = await databases.createDocument(
        DATABASE_ID,
        FINES_MANAGEMENT_COLLECTION_ID,
        ID.unique(),
        fineData,
      )

      console.log("Created new fine document:", response)

      if (!isFineDocument(response)) {
        console.error("Document structure mismatch:", response)
        throw new Error("Created document does not match FineDocument structure")
      }

      console.log(`Successfully created fine document with ID: ${response.$id}`)
      return response
    }
  } catch (error) {
    console.error("Error in createFineDocument:", error)
    throw error
  }
}

export const getFineDocuments = async (queries: string[] = []): Promise<FineDocument[]> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const allDocuments: FineDocument[] = []
    let lastId: string | undefined

    while (true) {
      const currentQueries = [...queries, Query.limit(100), Query.orderDesc("$createdAt")]
      if (lastId) {
        currentQueries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, currentQueries)

      const fineDocuments = response.documents.filter(isFineDocument)

      // Check for duplicates and delete them
      const uniqueFines = new Map<string, FineDocument>()
      const duplicatesToDelete: string[] = []

      for (const fine of fineDocuments) {
        const key = `${fine.studentId}-${fine.userId}-${fine.name}`
        if (uniqueFines.has(key)) {
          // Mark the duplicate for deletion
          duplicatesToDelete.push(fine.$id)
        } else {
          uniqueFines.set(key, fine)
        }
      }

      // Delete duplicates
      await Promise.all(
        duplicatesToDelete.map((id) => databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, id)),
      )

      console.log(`Deleted ${duplicatesToDelete.length} duplicate fine(s).`)

      allDocuments.push(...Array.from(uniqueFines.values()))

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return allDocuments
  } catch (error) {
    console.error("Error in getFineDocuments:", error)
    throw error
  }
}

export const deleteFines = async (documentId: string): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    await databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, documentId)

    console.log(`Successfully deleted fine document with ID: ${documentId}`)
  } catch (error) {
    console.error("Error in deleteFines:", error)
    throw error
  }
}

export const getTotalUniqueEvents = async (): Promise<number> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const uniqueEvents = new Set<string>()
    let lastId: string | undefined

    while (true) {
      const queries = [Query.limit(100)]
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, queries)

      response.documents.forEach((doc: Models.Document) => {
        if ((doc as Attendance).eventName) {
          uniqueEvents.add((doc as Attendance).eventName)
        }
      })

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return uniqueEvents.size
  } catch (error) {
    console.error("Error in getTotalUniqueEvents:", error)
    throw error
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    if (!DATABASE_ID || !USERS_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const allUsers: User[] = []
    let lastId: string | undefined

    while (true) {
      const queries = [Query.limit(100)]
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, queries)

      allUsers.push(...(response.documents as User[]))

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return allUsers
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    throw error
  }
}

const PENALTIES_MAP: Record<number, string> = {
  0: "No penalty",
  1: "1 pad grade 1 paper, 1 pencil",
  2: "2 pads Grade 2 paper, 2 pencils, 1 eraser",
  3: "3 Pads Grade 3 paper, 3 pencils, 2 eraser, 1 sharpener",
  4: "2 pads grade 4 paper 2 pencils, 2 ball pen, 1 crayon, 1 sharpener, 1 eraser",
  5: "2 Pads intermediate paper, 2 notebooks, 2 ball pen, 1 crayon",
  6: "2 Pads intermediate paper, 2 notebooks, 2 ball pen, 1 crayon, 2 pencils",
  7: "1 plastic envelop with handle, 2 Pads intermediate paper, 2 notebooks",
  8: "1 plastic envelop with handle, 2 Pads intermediate paper, 2 notebooks",
  9: "1 plastic envelop with handle, 2 Pads intermediate paper, 3 notebooks 2 pencils, 2 eraser, 1 sharpener",
  10: "1 plastic envelop with handle, 2 Pads intermediate paper, 3 notebooks 3 pencils, 2 eraser, 3 sharpener, 3 ball pen, 1 crayon",
}

export const updateAttendance = async (): Promise<void> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Delete all existing fine documents
    await deleteAllFineDocuments()

    // Check if there are any remaining documents
    const remainingDocs = await getFineDocuments()
    if (remainingDocs.length > 0) {
      throw new Error("Not all documents were deleted. Please try again.")
    }

    const generalAttendance = await getGeneralAttendance()
    const users = await getAllUsers()
    const totalEvents = await getTotalUniqueEvents()

    for (const user of users) {
      const userAttendance = generalAttendance.filter((a) => a.userId === user.$id)

      const presences = userAttendance.length
      const absences = Math.max(0, totalEvents - presences)

      const penalties = PENALTIES_MAP[absences] || PENALTIES_MAP[10]

      const fineData: FineDocumentData = {
        userId: user.$id,
        studentId: user.studentId,
        name: user.name,
        absences: absences.toString(),
        presences: presences.toString(),
        penalties,
        dateIssued: new Date().toISOString().split("T")[0],
        status: penalties === "No penalty" ? "Cleared" : "Pending",
      }

      // Create new fine document
      await createFineDocument(fineData)
    }

    console.log("Attendance and fines updated successfully")
  } catch (error) {
    console.error("Error in updateAttendance:", error)
    throw error
  }
}

async function deleteAllFineDocuments() {
  try {
    let documents
    do {
      documents = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [Query.limit(100)])

      for (const doc of documents.documents) {
        await new Promise((resolve) => setTimeout(resolve, 2000)) // 2-second delay
        await databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, doc.$id)
        console.log(`Deleted document ${doc.$id}`)
      }
    } while (documents.documents.length > 0)

    console.log("All fine documents deleted successfully")
  } catch (error) {
    console.error("Error deleting fine documents:", error)
    throw error
  }
}

